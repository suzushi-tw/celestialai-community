"use client"
import Image from "next/image"
import Link from "next/link"
import {
    ChevronLeft,
    Home,
    LineChart,
    Package,
    Package2,
    PanelLeft,
    PlusCircle,
    Search,
    Settings,
    ShoppingCart,
    Upload,
    Users2,
    Delete
} from "lucide-react"

import { Badge } from "@/components/ui/badge"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "./ui/scroll-area"
import { useState } from "react"
import { Value } from "@radix-ui/react-select"
import { useForceUpdate } from "framer-motion"
import { useChat } from "ai/react"
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
import toast from "react-hot-toast"

interface PageData {
    title: string;
    description: string;
}


function Docgendashboard() {


    const [nameinput, setNameinput] = useState('')

    const [description, setDescription] = useState('')

    const [source, setsource] = useState("online")

    const [pages, setpages] = useState(5)

    const handlesourcechange = (id: string) => {
        setsource(id)
    }

    const handlepagenumber = (id: string) => {
        const pageNumber = parseInt(id, 10);
        if (!isNaN(pageNumber)) {
            setpages(pageNumber);
        }
    }

    const [pageData, setPageData] = useState<PageData[]>(Array.from({ length: pages }, () => ({ title: '', description: '' })));


    // Function to update page data
    const handleInputChange = (index: number, field: keyof PageData, value: string) => {
        const newData = [...pageData];
        newData[index][field] = value;
        setPageData(newData);
        console.log(newData)
        console.log(pageData)
    };

    const addpage = () => {
        setpages(pages + 1)
        setPageData([...pageData, { title: '', description: '' }]);
    }

    const handleRowDeletion = (indexToDelete: number) => {
        console.log(indexToDelete);
        const updatedPageData = [...pageData];
        updatedPageData.splice(indexToDelete, 1);
        setPageData(updatedPageData);
        console.log(updatedPageData)
        setpages(pages - 1);
    };

    const startResearch = async () => {
        toast.success("Researching ...")
        try {
            // Send the data to your backend
            const response = await fetch('/api/researchdocx', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: nameinput,
                    description: description,
                    pages: pageData
                }),
            });

            if (!response.ok) {
                toast.error("There was an unexpected error ...")
                throw new Error('Failed to start research');
            }

            const result = await response.json();
            console.log(result.message);
        } catch (err) {
            console.error(err);

        } finally {

        }
    };
    const { messages, input, handleSubmit, isLoading, error, setMessages, append, setInput } =
        useChat({
            api: "/api/aihelper",
            body: {
                name: nameinput,
                description: description,
            },
            onResponse: response => {

            },
            onFinish: (message) => {
                console.log(message);
                const newData = JSON.parse(message.content);
                console.log(newData);
                setPageData(newData)
            }
        })

    return (
        <ScrollArea className="h-[calc(100vh-5rem)] ">
            <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <div className="mx-auto grid max-w-[68rem] flex-1 auto-rows-max gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" className="h-7 w-7">
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Back</span>
                        </Button>
                        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                            AI Researcher
                        </h1>
                        <Badge variant="outline" className="ml-auto sm:ml-0">
                            {source === 'online' && '🟢'}  {source}
                        </Badge>
                        <div className="hidden items-center gap-2 md:ml-auto md:flex">
                            <Button variant="outline" size="sm">
                                AI helper
                            </Button>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" onClick={startResearch}>Beginn Research</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Research in Progress</DialogTitle>
                                        <DialogDescription>
                                            This may take a few minutes, you may close this window, file will appear in database ...
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex items-center space-x-2">
                                        <div className="grid flex-1 gap-2">

                                        </div>

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
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
                        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                            <Card x-chunk="dashboard-07-chunk-0">
                                <CardHeader>
                                    <CardTitle>Document Details</CardTitle>
                                    <CardDescription>
                                        The description for your document so AI knows what to research about ...
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="name">Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                className="w-full"
                                                placeholder="Title of the document"
                                                value={nameinput}
                                                onChange={(event) => setNameinput(event.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-3">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                className="min-h-32 max-h-120"
                                                placeholder="Descrption of the document"
                                                value={description}
                                                onChange={(event) => setDescription(event.target.value)}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card x-chunk="dashboard-07-chunk-1" className="mb-6">
                                <CardHeader>
                                    <CardTitle>Details</CardTitle>
                                    <CardDescription>
                                        Enter the topic and description for each page
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead >Pages</TableHead>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Description</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pageData.map((_, rowIndex) => {
                                                const pageDataItem = pageData[rowIndex];
                                                return (
                                                    <TableRow key={rowIndex}>
                                                        <TableCell className="font-semibold">
                                                            {rowIndex + 1}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input value={pageDataItem.title} onChange={(e) => handleInputChange(rowIndex, 'title', e.target.value)} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Textarea value={pageDataItem.description} onChange={(e) => handleInputChange(rowIndex, 'description', e.target.value)} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                                                                handleRowDeletion(rowIndex);
                                                            }}>
                                                                <Delete className="h-5 w-5" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                                <CardFooter className="justify-center border-t p-4">
                                    <Button size="sm" variant="ghost" className="gap-1" onClick={addpage}>
                                        <PlusCircle className="h-3.5 w-3.5" />
                                        Add Page
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                            <Card x-chunk="dashboard-07-chunk-3">
                                <CardHeader>
                                    <CardTitle>Document Type</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="status">Type</Label>
                                            <Select>
                                                <SelectTrigger id="status" aria-label="Select status">
                                                    <SelectValue placeholder="Select " />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="docx">DOCX</SelectItem>
                                                    <SelectItem value="pptx">PPTX</SelectItem>
                                                    {/* <SelectItem value="archived">Archived</SelectItem> */}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card x-chunk="dashboard-07-chunk-3">
                                <CardHeader>
                                    <CardTitle>Pages</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="status">Number of pages</Label>
                                            <Select onValueChange={(value) => handlepagenumber(value)}>
                                                <SelectTrigger id="status" aria-label="Select status">
                                                    <SelectValue placeholder={pages} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">1</SelectItem>
                                                    <SelectItem value="2">2</SelectItem>
                                                    <SelectItem value="3">3</SelectItem>
                                                    <SelectItem value="4">4</SelectItem>
                                                    <SelectItem value="5">5</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card x-chunk="dashboard-07-chunk-3">
                                <CardHeader>
                                    <CardTitle>Sources for the document</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-6">
                                        <div className="grid gap-3">
                                            <Label htmlFor="status">One page of online research cost one credit</Label>
                                            <Select onValueChange={(value) => handlesourcechange(value)}>
                                                <SelectTrigger id="status" aria-label="Select status">
                                                    <SelectValue placeholder="Online " />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="online">Online</SelectItem>
                                                    {/* <SelectItem value="database">Database</SelectItem> */}
                                                    <SelectItem value="none">None</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 md:hidden">
                        <Button variant="outline" size="sm">
                            AI helper
                        </Button>
                        <Button size="sm">Beginn Research</Button>
                    </div>
                </div>
            </div>
        </ScrollArea>
    )
}

export default Docgendashboard
