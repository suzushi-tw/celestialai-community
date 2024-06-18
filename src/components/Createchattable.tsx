"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { trpc } from '@/app/_trpc/client'
import toast, { Toaster } from 'react-hot-toast';
import { useState } from "react"
import axios from "axios"
import { Label } from "./ui/label"
import { AnimatedBeam } from "./magicui/animated-beam"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Assistantsvg, Databasesvg } from "@/lib/icon"
import { Loader2 } from "lucide-react"
import GradualSpacing from "./magicui/gradual-spacing"
import { Skeleton } from "./ui/skeleton"
import { useRouter } from 'next/navigation'

export type FavoriteFile = {
    id: string;
    key: string;
    name: string;
    type: string;
    userId: string | null;
    url: string;
    createdAt: string;
    updatedAt: string;
};

const data: FavoriteFile[] = []


export const columns: ColumnDef<FavoriteFile>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: "ID",
        enableHiding: true,

    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <div className="truncate">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("createdAt"));
            return <div>{date.toLocaleDateString()}</div>;
        },
    },
]


const Circle = forwardRef<
    HTMLDivElement,
    { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
                className,
            )}
        >
            {children}
        </div>
    );
})

Circle.displayName = 'Circle';

export function Createchattable() {

    const router = useRouter()

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({ id: false, })
    const [rowSelection, setRowSelection] = React.useState({})

    const { data: favoritefile, isLoading } = trpc.getFilelist.useQuery();

    const [pagination, setPagination] = useState({
        pageIndex: 0, //initial page index
        pageSize: 5, //default page size
    });

    const table = useReactTable({
        data: favoritefile || [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },

    })

    const { mutate: startPolling } = trpc.getchatbot.useMutation(
        {
            onSuccess: (chatbot) => {
                router.push(`/dashboard/${chatbot.id}`)
            },
            retry: true,
            retryDelay: 500,
        }
    )

    const [loading, setIsLoading] = useState(false)
    const uploadnotion = () => {
        setIsLoading(true)

        const selectedRows = table.getSelectedRowModel().rows;
        const selectedIds = selectedRows.map(row => row.getValue("id")); // Extract the 'id' from each row


        axios.post('/api/createchat', { selectedIds, name })
            .then(response => {

                console.log(response.data);
                const chatbotId = response.data.chat_id;
                startPolling({ key: chatbotId });
               
            })
            .catch(error => {
                console.error('Error:', error);
                toast.error("An error occured ...")
            });
    }

    const [name, setname] = useState("")

    const containerRef = useRef<HTMLDivElement>(null);
    const div1Ref = useRef<HTMLDivElement>(null);
    const div2Ref = useRef<HTMLDivElement>(null);


    return (
        <div className="w-full">
            {loading ? (
                <>
                    <div
                        className="relative flex w-full max-w-[500px] items-center justify-center overflow-hidden rounded-lg border bg-background p-10 md:shadow-xl"
                        ref={containerRef}
                    >
                        <div className="flex h-full w-full flex-col items-stretch justify-between gap-10">
                            <div className="flex flex-row justify-between">
                                <Circle ref={div1Ref}>

                                    <Databasesvg />
                                </Circle>
                                <Circle ref={div2Ref}>

                                    <Assistantsvg />
                                </Circle>
                            </div>
                        </div>

                        <AnimatedBeam
                            containerRef={containerRef}
                            fromRef={div1Ref}
                            toRef={div2Ref}
                            startYOffset={10}
                            endYOffset={10}
                            curvature={-20}
                        />
                        <AnimatedBeam
                            containerRef={containerRef}
                            fromRef={div1Ref}
                            toRef={div2Ref}
                            reverse
                            startYOffset={-10}
                            endYOffset={-10}
                            curvature={20}
                        />
                    </div>
                    <div className='flex gap-1 items-center justify-center  text-zinc-700 text-center pt-2'>
                        <Loader2 className='h-3 w-3 animate-spin' />

                        <GradualSpacing
                            className="font-display text-center text-sm tracking-[-0.1em]  text-black dark:text-white md:text-sm md:leading-[5rem]"
                            text="Redirecting ..."
                        />
                    </div>
                </>

            ) : (
                <>
                    <div className="flex items-center pb-4 pt-1">

                        <Input
                            placeholder="Name of the chat bot"
                            value={name}
                            onChange={(event) => setname(event.target.value)}
                            className="max-w-sm"
                        />
                        {/* <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        className="max-w-sm"
                        placeholder="Name of the chat bot"
                        value={name}
                        onChange={(event) => setname(event.target.value)}
                    />
                </div> */}
                        <Button
                            className="ml-auto"
                            onClick={uploadnotion}>
                            Create</Button>

                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            )
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <>
                                        <Skeleton className="w-full h-10" />
                                        <Skeleton className="w-full h-10" />
                                    </>
                                ) : (
                                    <>
                                        {
                                            table.getRowModel().rows?.length ? (
                                                table.getRowModel().rows.map((row) => (
                                                    <TableRow
                                                        key={row.id}
                                                        data-state={row.getIsSelected() && "selected"}
                                                    >
                                                        {row.getVisibleCells().map((cell) => (
                                                            <TableCell key={cell.id}>
                                                                {flexRender(
                                                                    cell.column.columnDef.cell,
                                                                    cell.getContext()
                                                                )}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={columns.length}
                                                        className="h-24 text-center"
                                                    >
                                                        No results.
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        }
                                    </>
                                )}

                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <div className="flex-1 text-sm text-muted-foreground">
                            {table.getFilteredSelectedRowModel().rows.length} of{" "}
                            {table.getFilteredRowModel().rows.length} row(s) selected.
                        </div>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div >
    )
}
