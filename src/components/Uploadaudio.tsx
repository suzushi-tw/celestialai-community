'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'

import Dropzone from 'react-dropzone'
import { Cloud, File, Loader2 } from 'lucide-react'
import { Progress } from './ui/progress'
import { useToast } from './ui/use-toast'
import { trpc } from '@/app/_trpc/client'
import { useRouter } from 'next/navigation'
import { uploadToS3 } from '@/lib/s3';
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { PlusCircle } from 'lucide-react'
import { useDropzone } from 'react-dropzone';
import toast, { Toaster } from 'react-hot-toast';
import { Audiosvg } from '@/lib/icon'
import { uploadS3audio } from '@/lib/s3audio'
// import pdfParse from 'pdf-parse';

const notify = () => toast.error('Only PDF and word document are allowed!');
const wordtoast = () => toast(
    "Word document can lead to longer processing time !",
    {
        duration: 6000,
    }
);
const UploadDropzone = () => {
    const router = useRouter()

    const [isUploading, setIsUploading] =
        useState<boolean>(false)
    const [uploadProgress, setUploadProgress] =
        useState<number>(0)
    const { toast } = useToast()


    const { mutate, isLoading } = useMutation({
        mutationFn: async ({
            file_key,
            file_name,
        }: {
            file_key: string;
            file_name: string;
        }) => {
            const response = await axios.post("/api/uploadaudio", {
                file_key,
                file_name,
            });
            return response.data;
        },
    });

    const [limitExceeded, setLimitExceeded] = useState(false);

    useEffect(() => {
        console.log("limitExceeded", limitExceeded);
    }, [limitExceeded]);

    const startSimulatedProgress = () => {
        setUploadProgress(0)

        const interval = setInterval(() => {
            setUploadProgress((prevProgress) => {
                if (prevProgress >= 95) {
                    clearInterval(interval)
                    return prevProgress
                }
                return prevProgress + 5
            })
        }, 500)

        return interval
    }


    return (
        <Dropzone
            multiple={false}
            onDrop={async (acceptedFile) => {
                setIsUploading(true)

                const progressInterval = startSimulatedProgress()
                const fileName = acceptedFile[0].name;
                if (acceptedFile[0].type !== 'audio/mpeg' && acceptedFile[0].type !== 'audio/wav') {
                    setIsUploading(false);
                    setLimitExceeded(true);
                    notify();
                    // Show a toast message
                    return toast({
                        title: 'File type not allowed',
                        description: `Please upload supported file type !`,
                        variant: 'destructive',
                    });

                }

                const data = await uploadS3audio(acceptedFile[0])


                try {

                    if (!data?.file_key || !data.file_name) {

                        return;
                    }
                    mutate(data, {
                        onSuccess: ({ file_id }) => {
                        
                            console.log("success")
                            clearInterval(progressInterval)
                            setUploadProgress(100)

                          
                        },
                        onError: (err) => {

                            console.error(err);
                            return toast({
                                title: 'There was an unexpected error',
                                description: `Please try again later`,
                                variant: 'destructive',
                            });
                        },
                    });

                } catch (error) {
                    console.log(error);
                }
            }}>
            {({ getRootProps, getInputProps, acceptedFiles }) => (
                <div
                    {...getRootProps()}
                    className='border h-64 m-4 border-dashed border-gray-300 rounded-lg'>
                    <Toaster />
                    <div className='flex items-center justify-center h-full w-full'>
                        <label
                            htmlFor='dropzone-file'
                            className='flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'>
                            <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                                {/* <Cloud className='h-6 w-6 text-zinc-500 mb-2' /> */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2"><path strokeDasharray="2 4" strokeDashoffset="6" d="M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3"><animate attributeName="stroke-dashoffset" dur="0.6s" repeatCount="indefinite" values="6;0" /></path><path strokeDasharray="30" strokeDashoffset="30" d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.1s" dur="0.3s" values="30;0" /></path><path strokeDasharray="10" strokeDashoffset="10" d="M12 16v-7.5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.5s" dur="0.2s" values="10;0" /></path><path strokeDasharray="6" strokeDashoffset="6" d="M12 8.5l3.5 3.5M12 8.5l-3.5 3.5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.7s" dur="0.2s" values="6;0" /></path></g></svg>
                                <p className='mt-2 mb-2 text-sm text-zinc-700'>
                                    <span className='font-semibold'>
                                        Click to upload
                                    </span>{' '}
                                    or drag and drop
                                </p>
                             
                                <p className={`text-xs ${limitExceeded ? 'text-red-500' : 'text-zinc-500'}`}>
                                    Audio ( .mp3, .mav )
                                </p>
                            </div>

                            {acceptedFiles && acceptedFiles[0] ? (
                                <div className='max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200'>
                                    <div className='px-3 py-2 h-full grid place-items-center'>
                                        <File className='h-4 w-4 text-blue-500' />
                                    </div>
                                    <div className='px-3 py-2 h-full text-sm truncate'>
                                        {acceptedFiles[0].name}
                                    </div>
                                </div>
                            ) : null}

                            {isUploading ? (
                                <div className='w-full mt-4 max-w-xs mx-auto'>
                                    <Progress
                                        indicatorColor={
                                            uploadProgress === 100
                                                ? 'bg-green-500'
                                                : ''
                                        }
                                        value={uploadProgress}
                                        className='h-1 w-full bg-zinc-200'
                                    />
                                    {uploadProgress === 100 ? (
                                        <div className='flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2'>
                                            {/* <Loader2 className='h-3 w-3 animate-spin' /> */}
                                             Done ...
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}

                            <input
                                {...getInputProps()}
                                // type='file'
                                // id='dropzone-file'
                                className='hidden'
                            />
                        </label>
                    </div>
                </div>
            )}
        </Dropzone>
    )
}

const UploadAudio = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false)

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(v) => {
                if (!v) {
                    setIsOpen(v)
                }
            }}>
            <DialogTrigger
                onClick={() => setIsOpen(true)}
                asChild>
                <Button size="sm" className="h-8 gap-1 bg-transparent hover:bg-transparent">


                    <Audiosvg />
                </Button>
            </DialogTrigger>

            <DialogContent>
                <UploadDropzone />
            </DialogContent>
        </Dialog>
    )
}

export default UploadAudio