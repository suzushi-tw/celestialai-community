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
import toast from 'react-hot-toast'
import { Loader2, Trash } from 'lucide-react'
import { Notionsvg } from '@/lib/icon'

function Notion() {

    const { data: files, isLoading } = trpc.getNotion.useQuery();
    const [name, setName] = useState("")

    const utils = trpc.useUtils();

    const changename = (id: string) => {
        toast.success("Saving !")
        updatefilename(id, name)
    }

    const { mutate: deleteFile } = trpc.deleteFile.useMutation({
        onSuccess: () => {
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
                                                            <Notionsvg />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {file.name}
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
                        <p>Upload your first file </p>
                    </div>
                )
            }
        </div >

    )
}

export default Notion
