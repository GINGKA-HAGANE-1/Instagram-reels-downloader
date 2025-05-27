"use client";

import React, { useState } from "react";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import { getHttpErrorMessage } from "@/lib/http";

import { useVideoInfo } from "@/services/api/queries";

const formSchema = z.object({
  postUrl: z.string().url({
    message: "Provide a valid Instagram post link",
  }),
});

// Function to detect Android environment
const isAndroid = () => {
  return typeof window !== "undefined" && 
    (window.navigator.userAgent.includes("Android") || window.navigator.userAgent.includes("wv"));
};

// Function to handle direct Android download
async function downloadToAndroid(videoUrl: string, filename: string) {
  try {
    const response = await fetch(videoUrl);
    if (!response.ok) throw new Error("Failed to fetch video");
    
    const blob = await response.blob();

    // Try to use the Native File System API if available
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'Video File',
            accept: { 'video/mp4': ['.mp4'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
      } catch (e) {
        console.log("Native File System API failed, falling back to alternative method");
      }
    }

    // Fallback method using content-disposition
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    a.setAttribute('data-downloadurl', ['video/mp4', filename, blobUrl].join(':'));
    a.setAttribute('target', '_system');
    a.click();
    URL.revokeObjectURL(blobUrl);
    return true;
  } catch (error) {
    console.error("Android download error:", error);
    throw new Error("Failed to save to Downloads. Please check app permissions.");
  }
}

export function InstagramVideoForm() {
  const [downloadStatus, setDownloadStatus] = useState<string>("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      postUrl: "",
    },
  });

  const { error, isPending, mutateAsync: getVideoInfo } = useVideoInfo();

  const httpError = getHttpErrorMessage(error);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { postUrl } = values;
    setDownloadStatus("Starting download...");
    try {
      const videoInfo = await getVideoInfo({ postUrl });
      const { filename, videoUrl } = videoInfo;
      
      if (isAndroid()) {
        setDownloadStatus("Saving to Downloads folder...");
        await downloadToAndroid(videoUrl, filename);
        setDownloadStatus("Video saved to Downloads folder!");
      } else {
        await downloadFile(videoUrl, filename);
        setDownloadStatus("Download complete!");
      }
    } catch (error: any) {
      console.error(error);
      setDownloadStatus("Download failed. " + error.message);
    }
  }
  
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="bg-accent/20 my-4 flex w-full max-w-2xl flex-col items-center rounded-lg border px-4 pb-16 pt-8 shadow-md sm:px-8"
      >
        <div className="mb-2 h-6 w-full px-2 text-start text-red-500">
          {httpError}
        </div>
        <div className="relative mb-6 flex w-full flex-col items-center gap-4 sm:flex-row">
          <FormField
            control={form.control}
            name="postUrl"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    disabled={isPending}
                    type="url"
                    placeholder="Paste your Instagram link here..."
                    className="h-12 w-full sm:pr-28"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={isPending}
            type="submit"
            className="right-1 top-1 w-full sm:absolute sm:w-fit"
          >
            {isPending ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : (
              <Download className="mr-2" />
            )}
            Download
          </Button>
        </div>
        {downloadStatus && (
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
            {downloadStatus}
          </p>
        )}
        <p className="text-muted-foreground text-center text-xs mt-4">
          {isAndroid() 
            ? "Videos will be saved directly to your Downloads folder" 
            : "Click the download button to save the video"}
        </p>
      </form>
    </Form>
  );
}

// Regular download function for non-Android platforms
export async function downloadFile(videoUrl: string, filename: string) {
  try {
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch the video.");
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error: any) {
    console.error("Download error:", error);
    throw new Error("Failed to download video. Please try again.");
  }
}
