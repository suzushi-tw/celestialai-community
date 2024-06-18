import React from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from './ui/label'

import { Input } from './ui/input'
import { Createchattable } from './Createchattable'

function Createchat() {
    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button >Create New Chatbot</Button>
                </DialogTrigger>
                <DialogContent className="w-full max-w-xl max-h-[calc(100vh-3.5rem)]">
                    <DialogHeader>
                        <DialogTitle>Create Chatbot</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Createchattable />
                    </div>

                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Createchat
