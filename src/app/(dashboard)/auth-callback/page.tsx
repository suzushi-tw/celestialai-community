/* eslint-disable react-hooks/rules-of-hooks */
'use client'
import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '../../_trpc/client';
import { Loader2 } from 'lucide-react';
import { useRef } from 'react';

const AuthCallbackContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get('origin');

  const retry = useRef(0);
  const maxRetryCount = 5;

  const { refetch, data } = trpc.authCallback.useQuery(undefined, {
    onSuccess: (data) => {
      console.log(data)
      router.push(origin ? `/${origin}` : "/dashboard");
    },
    onError: (err) => {
      console.log(err);
      if (err.data?.code === "UNAUTHORIZED") {
        retry.current = retry.current + 1;
        if (retry.current <= maxRetryCount) {
          setTimeout(() => {
            refetch();
          }, 500);
        } else {
          router.push("/sign-in");
        }
      }
    },
    retry: false,
    retryDelay: 500,
  });

  return (
    <div className='w-full mt-24 flex justify-center'>
      <div className='flex flex-col items-center gap-2'>
        <Loader2 className='h-8 w-8 animate-spin text-zinc-800' />
        <h3 className='font-semibold text-xl'>
          Setting up your account...
        </h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  );
};

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
};


export default page