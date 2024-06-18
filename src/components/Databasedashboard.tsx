"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import UploadButton from "./Uploadbutton"
import { Notionsvg, Urlsvg } from "@/lib/icon"
import { Addurlbutton } from "./Addurl"
import File from "./Filetab/File"
import Airesearch from "./Filetab/Airesearch"
import Url from "./Filetab/Url"
import Addnotion from "./Addnotion"
import Notion from "./Filetab/Notion"
import Audio from "./Filetab/Audio"



function Databasedashboard() {


    return (

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Tabs defaultValue="files" >
                <div className="flex items-center">
                    <TabsList>
                        <TabsTrigger value="files">My files</TabsTrigger>
                        <TabsTrigger value="url">Url</TabsTrigger>
                        <TabsTrigger value="notion">Notion</TabsTrigger>
                        <TabsTrigger value="audio">Audio</TabsTrigger>
                        <TabsTrigger value="research">AI Research</TabsTrigger>
                    </TabsList>
                    <div className="ml-auto flex items-center gap-2">
                        <Addnotion />
                        <Addurlbutton />
                        <UploadButton />
                    </div>
                </div>
                <TabsContent value="files" >
                    <Card x-chunk="dashboard-06-chunk-0" className="h-[calc(100vh-3.5rem-5rem)]">
                        <CardHeader>
                            <CardTitle>Files</CardTitle>
                            <CardDescription>
                                All of your uploaded files ...
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <File />
                        </CardContent>

                    </Card>
                </TabsContent>
                <TabsContent value="url" >
                    <Card x-chunk="dashboard-06-chunk-0" className="h-[calc(100vh-3.5rem-5rem)]">
                        <CardHeader>
                            <CardTitle>Url</CardTitle>
                            <CardDescription>
                                All of your added websites ...
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Url />
                        </CardContent>

                    </Card>
                </TabsContent>
                <TabsContent value="notion" >
                    <Card x-chunk="dashboard-06-chunk-0" className="h-[calc(100vh-3.5rem-5rem)]">
                        <CardHeader>
                            <CardTitle>Notion</CardTitle>
                            <CardDescription>
                                Saved notion pages ...
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Notion />

                        </CardContent>

                    </Card>
                </TabsContent>
                <TabsContent value="audio" >
                    <Card x-chunk="dashboard-06-chunk-0" className="h-[calc(100vh-3.5rem-5rem)]">
                        <CardHeader>
                            <CardTitle>Audio</CardTitle>
                            <CardDescription>
                                Uploaded audio ...
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Audio />
                        </CardContent>

                    </Card>
                </TabsContent>
                <TabsContent value="research" >
                    <Card x-chunk="dashboard-06-chunk-0" className="h-[calc(100vh-3.5rem-5rem)]">
                        <CardHeader>
                            <CardTitle>Research</CardTitle>
                            <CardDescription>
                                Research report by AI ...
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Airesearch />
                        </CardContent>

                    </Card>
                </TabsContent>
            </Tabs>
        </main>

    )
}

export default Databasedashboard