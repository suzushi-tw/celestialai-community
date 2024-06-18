"use client"
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
import { Notionsvg } from '@/lib/icon'
import { Input } from './ui/input'
import { Createchattable } from './Createchattable'
import { Addnotiontable } from './Addnotiontable'

function Addnotion() {
    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                        <Notionsvg />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Notion
                        </span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="w-full max-w-xl max-h-[calc(100vh-3.5rem)]">
                    <DialogHeader>
                        <DialogTitle><Notionsvg /></DialogTitle>
                        <DialogDescription>
                            Select Notion pages ...
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Addnotiontable />
                    </div>

                </DialogContent>
            </Dialog>
        </div>
    )
}

export default Addnotion
