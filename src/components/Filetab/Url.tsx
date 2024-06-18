import React, { useState } from 'react'
import { Table, TableHeader, TableHead, TableRow, TableCell, TableBody } from '../ui/table'
import { Badge } from '../ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuItem } from '../ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '../ui/button'
import { trpc } from '@/app/_trpc/client'
import Image from 'next/image'
import { Skeleton } from '../ui/skeleton'
import { ScrollArea } from '../ui/scroll-area'
import { format } from "date-fns"
import { Wordsvg, PPTsvg, Urlsvg, PDFsvg } from '@/lib/icon'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog"
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { updatefilename } from '@/serveractions/action'
import { Copy } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { Trash } from 'lucide-react'
import toast from 'react-hot-toast'

function Url() {

    const { data: files, isLoading } = trpc.getWeb.useQuery();
    const [name, setName] = useState("")

    const utils = trpc.useUtils();

    const { mutate: deleteFile } = trpc.deleteFile.useMutation({
        onSuccess: () => {
            toast.success("Deleted")
            utils.getUserFiles.invalidate()
        },
        onMutate({ id }) {
            setFile(id);
        },
        onSettled() {
            setFile(null);
        }
    })
    const [currentlyDeletingFile, setFile] = useState<string | null>(null);

    const changename = (id: string) => {
        toast.success("Updating name ...")
        updatefilename(id, name)
    }


    return (

        <div>

            {
                files && files?.length !== 0 ? (
                    <div>
                        <ScrollArea className='max-h-[clac(100vh-3.5rem-30rem)] overflow-y-auto'>
                            <div className='h-[66vh] relative overflow-auto'>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="hidden w-[100px] sm:table-cell">
                                                <span className="sr-only">Image</span>
                                            </TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Url</TableHead>
                                            <TableHead>Status</TableHead>

                                            <TableHead className="hidden md:table-cell">
                                                Created at
                                            </TableHead>
                                            <TableHead>
                                                <span className="sr-only">Actions</span>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody >

                                        {files
                                            .sort(
                                                (a, b) =>
                                                    new Date(b.createdAt).getTime() -
                                                    new Date(a.createdAt).getTime()
                                            )
                                            .map((file) => (

                                                <TableRow key={file.id}>
                                                    <TableCell className="hidden sm:table-cell">
                                                        <div className=' flex items-center justify-center overflow-hidden '>
                                                            <Urlsvg />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium truncate">
                                                        {file.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline" className='truncate'>{file.url}</Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="sm:max-w-md">
                                                                <DialogHeader>
                                                                    <DialogTitle>Link</DialogTitle>
                                                                    <DialogDescription>
                                                                        Click to copy the url ...
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="grid flex-1 gap-2">
                                                                        <Label htmlFor="link" className="sr-only">
                                                                            Link
                                                                        </Label>
                                                                        <Input
                                                                            id="link"
                                                                            defaultValue={file.url}
                                                                            readOnly
                                                                        />
                                                                    </div>
                                                                    <Button type="submit" size="sm" className="px-3">
                                                                        <span className="sr-only">Copy</span>
                                                                        <Copy className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                                <DialogFooter className="sm:justify-start">
                                                                    <DialogClose asChild>
                                                                        <Button type="button" variant="secondary">
                                                                            Close
                                                                        </Button>
                                                                    </DialogClose>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{file.uploadStatus}</Badge>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">
                                                        {format(
                                                            new Date(file.createdAt),
                                                            'MMM yyyy'
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger >
                                                                <Button
                                                                    aria-haspopup="true"
                                                                    size="icon"
                                                                    variant="ghost"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                    <span className="sr-only">Toggle menu</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem asChild>
                                                                    <Dialog >
                                                                        <DialogTrigger >
                                                                            <Button variant="outline">Update Name</Button>
                                                                        </DialogTrigger>
                                                                        <DialogContent className="sm:max-w-[425px]">

                                                                            <DialogHeader>
                                                                                <DialogTitle>Update name</DialogTitle>

                                                                            </DialogHeader>
                                                                            <div className="grid gap-4 py-4">

                                                                                <div className="grid grid-cols-4 items-center gap-4">
                                                                                    <Label htmlFor="name" className="text-right">
                                                                                        Name
                                                                                    </Label>
                                                                                    <Input
                                                                                        id="name"
                                                                                        placeholder="name ..."
                                                                                        className="col-span-3"
                                                                                        value={name}
                                                                                        onChange={(event) => setName(event.target.value)}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <DialogFooter>
                                                                                <DialogClose>
                                                                                    <Button onClick={() => changename(file.id)}>Save</Button>
                                                                                </DialogClose>

                                                                            </DialogFooter>
                                                                        </DialogContent>
                                                                    </Dialog>


                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild className='mt-2 w-full focus-visible:ring-0' >
                                                                    <Button variant="outline" className='text-red-600  focus-visible:ring-0 hover:text-red-400'
                                                                        onClick={() =>
                                                                            deleteFile({ id: file.id, key: file.key })
                                                                        }
                                                                    >
                                                                        {currentlyDeletingFile === file.id ? (
                                                                            <Loader2 className='h-4 w-4 animate-spin' />
                                                                        ) : (
                                                                            <Trash className='h-4 w-4' />
                                                                        )}
                                                                    </Button>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>

                                            ))}

                                    </TableBody>
                                </Table>
                            </div>
                        </ScrollArea>
                    </div>
                ) : isLoading ? (
                    <div className='mt-3 flex flex-col items-center gap-2'>
                        <Skeleton className='my-2 w-full h-20' />
                        <Skeleton className='my-2 w-full h-20' />
                    </div>
                ) : (

                    <div className='mt-3 flex flex-col items-center gap-2'>

                        <Image alt='work image' width={200} height={200} src={"https://image.celestialai.co/working.png"} />
                        <h3 className='font-semibold text-xl'>
                            Pretty empty around here ...
                        </h3>
                        <p>Add your first website ... </p>
                    </div>
                )
            }
        </div >

    )
}

export default Url
