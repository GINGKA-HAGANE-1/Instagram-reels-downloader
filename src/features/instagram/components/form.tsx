"use client";

import React, { useState, useEffect } from "react";

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
    // Check if we're in Android WebView
    if (window.Android) {
      // Use Android's native download manager through WebView interface
      window.Android.downloadFile(videoUrl, filename);
      return true;
    }

    // Fallback for regular Android browser
    const response = await fetch(videoUrl);
    if (!response.ok) throw new Error("Failed to fetch video");
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    // Create an invisible iframe for download
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    // Create download link in iframe
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    a.setAttribute('target', '_system');
    a.setAttribute('rel', 'noopener');
    
    // Add download attributes for Android
    a.setAttribute('data-downloadurl', ['video/mp4', filename, blobUrl].join(':'));
    
    // Trigger download
    if (iframe.contentWindow) {
      iframe.contentWindow.document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        document.body.removeChild(iframe);
      }, 2000);
    }

    return true;
  } catch (error) {
    console.error("Android download error:", error);
    throw new Error("Failed to save to Downloads. Please check app permissions.");
  }
}

// Add interface for Android WebView bridge
declare global {
  interface Window {
    Android?: {
      downloadFile: (url: string, filename: string) => void;
    };
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

  // Listen for download status from Android WebView
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.onAndroidDownloadComplete = () => {
        setDownloadStatus("Video saved to Downloads folder!");
      };
      window.onAndroidDownloadError = (error: string) => {
        setDownloadStatus("Download failed: " + error);
      };
    }
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { postUrl } = values;
    setDownloadStatus("Starting download...");
    try {
      const videoInfo = await getVideoInfo({ postUrl });
      const { filename, videoUrl } = videoInfo;
      
      if (isAndroid()) {
        setDownloadStatus("Saving to Downloads folder...");
        await downloadToAndroid(videoUrl, filename);
        // Status will be updated by the Android WebView callback
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
