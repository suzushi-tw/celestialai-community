'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy } from "lucide-react"
import { Switch } from "./ui/switch"
import { useState } from "react"
import axios from "axios"
import toast, { Toaster } from 'react-hot-toast';
import { Urlsvg } from "@/lib/icon"
import { trpc } from "@/app/_trpc/client"


const notify = () => toast.success('Adding url ...');

export function Addurlbutton() {

    const { data: account } = trpc.getAccountdetail.useQuery();

    const [name, setName] = useState('')
    const [url, setUrl] = useState('')

    const handleSubmit = async () => {

        notify();
        try {
            const response = await axios.post('api/addurl', {
                name,
                url
            })

            // handle response here
        } catch (error) {
            // handle error here
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 gap-1">

                    <Urlsvg />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Url
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">

                <DialogHeader>
                    <DialogTitle>Website</DialogTitle>
                    <DialogDescription>
                        Provide the latest information to AI. Website behind login or paywall will not work !!!
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            placeholder="Name for the website ..."
                            className="col-span-3"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="url" className="text-right">
                            Url
                        </Label>
                        <Input
                            id="url"
                            placeholder="Url of the website ..."
                            className="col-span-3"
                            value={url}
                            onChange={(event) => setUrl(event.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose>
                        <Button onClick={handleSubmit} disabled={account?.Filenum === 20}>Send</Button>
                    </DialogClose>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
