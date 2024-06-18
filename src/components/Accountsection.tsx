'use client'


import { trpc } from '@/app/_trpc/client'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent
} from './ui/card'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { Dropboxsvg } from '@/lib/icon'
import axios from 'axios'
import Link from 'next/link'
import { ScrollArea } from './ui/scroll-area'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { setAimodel, setscroll } from '@/serveractions/action'


interface AccountProps {
  aimodel?: string
  scroll?: boolean
}

declare global {
  interface Window { Dropbox: any; }
}

interface DropboxFile {
  id: string;
  name: string;
  link: string;
  bytes: number;
  icon: string;
  thumbnailLink?: string;
  isDir: boolean;
}

const Accountsection = ({
  aimodel, scroll
}: AccountProps) => {

  console.log(scroll)
  console.log(aimodel)

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.dropbox.com/static/api/2/dropins.js';
    script.id = 'dropboxjs';
    script.dataset.appKey = `${process.env.NEXT_PUBLIC_DROPBOX_KEY}`;
    document.body.appendChild(script);
  }, []);

  const handlescrolleffect = async (selectedValue: string) => {
    toast.success("Setting updated")
    if (selectedValue == 'true') {
      setscroll(true)
    } else if (selectedValue == 'false') {
      setscroll(false)
    }
  };

  const [model, setModel] = useState(aimodel || 'gpt-3.5-turbo')

  const handleAimodel = async (selectedValue: string) => {
    toast.success("AI model Updated !")
    setAimodel(selectedValue)
  };

  const modelDisplayNames = {
    "gpt-3.5-turbo": "GPT 3.5",
    "claude-3-haiku-20240307": "Claude Haiku",
    "gpt-4o-2024-05-13": "GPT 4 O ⚡️",
    "claude-3-sonnet-20240229": "Claude Sonnet ⚡️",
    "gpt-4-1106-preview": "GPT 4 Turbo ⚡️",
  };


  return (
    <main className=' w-full max-w-5xl items-center'>
      <ScrollArea className='h-[calc(100vh-3.5rem-5rem)]'>
        <div className="space-y-0.5 ">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings ...
          </p>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <nav
            className="grid mt-6 gap-4 text-sm text-muted-foreground" x-chunk="dashboard-04-chunk-0"
          >
            <Card>
              <CardTitle className='text-xl text-center mt-2'>Scroll Effect</CardTitle>
              <CardDescription className='text-center'>
                Select the scroll effect...
              </CardDescription>
              <CardContent className='my-3'>
                <Select onValueChange={handlescrolleffect}>
                  <SelectTrigger className="">
                    <SelectValue placeholder={scroll ? "True" : "False"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Settings</SelectLabel>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
            <Card>
              <CardTitle className='text-xl text-center mt-2'>AI model</CardTitle>
              <CardDescription className='text-center'>
                Select the scroll effect...
              </CardDescription>
              <CardContent className='my-3'>
                <Select onValueChange={handleAimodel}>
                  <SelectTrigger className="">
                    <SelectValue placeholder={modelDisplayNames[aimodel as keyof typeof modelDisplayNames]} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Models</SelectLabel>
                      <SelectItem value="gpt-3.5-turbo">GPT 3.5</SelectItem>
                      <SelectItem value="claude-3-haiku-20240307">Claude Haiku</SelectItem>
                      <SelectItem value="gpt-4o-2024-05-13" >GPT 4 O ⚡️</SelectItem>
                      <SelectItem value="claude-3-sonnet-20240229" >Claude Sonnet ⚡️</SelectItem>
                      <SelectItem value="gpt-4-1106-preview">GPT 4 Turbo ⚡️</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

          </nav>
          <div className="grid gap-6">

            <Card className='mt-6 max-w-3xl'>
              <CardHeader>
                <CardTitle>Connect with Notion</CardTitle>
                <CardDescription>
                  Import from your Notion database
                </CardDescription>
              </CardHeader>
              <CardFooter className="border-t px-6 py-4">
                <Link className="bg-white "
                  href={`${process.env.NEXT_PUBLIC_NOTIONURL}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="34.765625" viewBox="0 0 512 178"><path fill="#FFF" d="M10.691 7.666L109.012.404c12.077-1.037 15.181-.338 22.774 5.183l31.386 22.11c5.177 3.803 6.9 4.84 6.9 8.98v121.26c0 7.6-2.76 12.095-12.42 12.782l-114.177 6.912c-7.25.344-10.703-.693-14.5-5.532L5.864 142.046C1.718 136.514 0 132.374 0 127.535V19.748C0 13.535 2.76 8.353 10.691 7.666" /><path d="M109.012.404L10.691 7.666C2.761 8.353 0 13.536 0 19.748v107.787c0 4.839 1.718 8.979 5.864 14.511L28.975 172.1c3.797 4.84 7.25 5.876 14.5 5.532l114.177-6.912c9.654-.687 12.42-5.182 12.42-12.782V36.677c0-3.928-1.551-5.059-6.118-8.411l-.788-.569l-31.38-22.11C124.193.067 121.09-.633 109.012.404M46.057 34.692c-9.323.628-11.437.77-16.732-3.536L15.862 20.447c-1.368-1.386-.681-3.115 2.766-3.459l94.519-6.906c7.936-.693 12.07 2.073 15.174 4.49l16.212 11.745c.693.35 2.416 2.417.343 2.417l-97.61 5.875zM35.188 156.901V53.96c0-4.496 1.38-6.57 5.515-6.919l112.11-6.562c3.802-.344 5.52 2.073 5.52 6.562v102.255c0 4.495-.693 8.298-6.9 8.641l-107.283 6.22c-6.207.343-8.962-1.724-8.962-7.256M141.091 59.48c.687 3.11 0 6.219-3.11 6.574l-5.17 1.025v76.004c-4.49 2.416-8.624 3.796-12.077 3.796c-5.52 0-6.9-1.73-11.035-6.906l-33.814-53.2v51.47l10.697 2.423s0 6.22-8.63 6.22l-23.792 1.38c-.693-1.387 0-4.84 2.41-5.527l6.214-1.724V72.96l-8.624-.698c-.693-3.11 1.03-7.6 5.863-7.95l25.528-1.717l35.183 53.887V68.808l-8.967-1.03c-.693-3.809 2.067-6.575 5.514-6.912zm104.322 66.39V79.02h.811l33.785 46.85h10.637V57.022h-11.828v46.803h-.811l-33.785-46.803h-10.679v68.842h11.876zm78.663 1.055c15.607 0 25.101-10.212 25.101-27.151c0-16.893-9.542-27.151-25.101-27.151c-15.507 0-25.096 10.306-25.096 27.15c0 16.94 9.447 27.152 25.096 27.152m0-9.927c-8.251 0-12.972-6.296-12.972-17.224c0-10.88 4.721-17.224 12.972-17.224c8.209 0 12.93 6.343 12.93 17.224c0 10.928-4.674 17.224-12.93 17.224m35.91-56.109v13.12h-8.25v9.447h8.25v28.484c0 10.116 4.775 14.173 16.75 14.173c2.287 0 4.485-.237 6.202-.574v-9.258c-1.433.142-2.34.237-4.01.237c-4.957 0-7.155-2.286-7.155-7.44V83.457h11.165V74.01h-11.165V60.883h-11.786zm30.042 64.981h11.787V73.671h-11.787zm5.87-60.829c3.909 0 7.06-3.157 7.06-7.113c0-3.963-3.145-7.161-7.06-7.161c-3.862 0-7.06 3.198-7.06 7.16c0 3.957 3.198 7.108 7.06 7.108zm38.25 61.884c15.601 0 25.096-10.212 25.096-27.151c0-16.893-9.542-27.151-25.096-27.151c-15.512 0-25.101 10.306-25.101 27.15c0 16.94 9.447 27.152 25.101 27.152m0-9.927c-8.256 0-12.983-6.296-12.983-17.224c0-10.88 4.727-17.224 12.983-17.224c8.204 0 12.93 6.343 12.93 17.224c0 10.928-4.679 17.224-12.93 17.224m32.138 8.872h11.835V95.48c0-7.683 4.442-12.551 11.496-12.551c7.208 0 10.543 4.01 10.543 11.976v30.965H512V92.092c0-12.456-6.35-19.47-17.988-19.47c-7.783 0-13.03 3.578-15.512 9.4h-.812v-8.35h-11.402z" /></svg>
                </Link>
              </CardFooter>
            </Card>

            <Card className='mt-6 max-w-3xl'>
              <CardHeader>
                <CardTitle>Connect with Dropbox</CardTitle>
                <CardDescription>
                  Import file from your dropbox
                </CardDescription>
              </CardHeader>
              <CardFooter className="border-t px-6 py-4">
                <Button
                  className='hover:bg-transparent bg-transparent'
                  onClick={() => {
                    if (window.Dropbox) {
                      window.Dropbox.choose({
                        success: async function (files: DropboxFile[]) {
                          toast.success("Processing files ...")
                          const file_name = files[0].name;
                          const file_url = files[0].link
                          const file_key = files[0].id
                          let url = "/api/upload";
                          if (file_name.endsWith(".docx") || file_name.endsWith(".doc")) {
                            url = "/api/uploaddocx"
                          } else if (file_name.endsWith(".csv") || file_name.endsWith(".xlsx")) {
                            url = "/api/uploadcsv"
                          }
                          else if (file_name.endsWith(".pptx")) {
                            url = "/api/uploadpptx"
                          }
                          const response = await axios.post(url, {
                            file_key,
                            file_name,
                            file_url,
                            type: "dropbox"
                          });
                          console.log(files)
                        },
                        cancel: function () {
                          toast.error("Canceled ...")
                        },
                        linkType: "direct", // or "direct"
                        multiselect: false, // or true
                        extensions: ['.pdf', '.doc', '.docx', 'pptx', 'csv', 'xlsx'],
                        folderselect: false, // or true
                      });
                    }
                  }}>
                  <Dropboxsvg />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
       


      </ScrollArea>


    </main>
  )
}

export default Accountsection
