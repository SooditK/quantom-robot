import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialsOfUser } from "@/lib/initials";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/utils/api";
import { type OCR } from "@/utils/types";
import axios from "axios";
import { LucideUpload, SearchIcon, X } from "lucide-react";
import { type GetServerSideProps, type NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { type ChangeEvent, useState } from "react";
import { toast } from "react-hot-toast";

const Home: NextPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const openAiCompletionMutation = api.openai.textCompletion.useMutation();
  const openAiCompletionFromImageMutation =
    api.openai.textCompletionFromOCR.useMutation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { data: session, status } = useSession();
  const [prompt, setPrompt] = useState<string>("");
  const [result, setResult] = useState<string>("");
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file && file.type.startsWith("image/")) {
        setSelectedFile(file);
      } else {
        toast.error("Invalid File Type");
        return;
      }
    }
  }

  if (!session) {
    return <div>Not logged in</div>;
  }

  async function onOpenAiCompletion() {
    if (!prompt) {
      toast.error("Please enter a prompt");
      return;
    } else if (prompt === "Hello") {
      toast.error("Hello is not a prompt");
      return;
    } else if (prompt === "Hello,") {
      toast.error("Hello, is not a prompt");
      return;
    } else if (prompt === "Hello, ") {
      toast.error("Hello,  is not a prompt");
      return;
    } else {
      toast.loading("Loading...");
      setIsLoading(true);
      const result = await openAiCompletionMutation.mutateAsync({
        prompt,
      });
      if (result && result.text) {
        toast.dismiss();
        setIsLoading(false);
        setResult(result.text);
      } else {
        toast.dismiss();
        setIsLoading(false);
        toast.error("Something went wrong");
      }
    }
  }

  async function ocrImage(): Promise<void> {
    setIsLoading(true);
    const baseurl = "https://api.ocr.space/parse/image";
    const formdata = new FormData();
    formdata.append("language", "eng");
    formdata.append("isOverlayRequired", "false");
    formdata.append("file", selectedFile as Blob);
    formdata.append("iscreatesearchablepdf", "false");
    formdata.append("issearchablepdfhidetextlayer", "false");
    console.log({ formdata });
    const res = await axios.post<OCR>(baseurl, formdata, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_OCR_API_KEY,
      },
    });
    if (
      res.data &&
      res.data.ParsedResults &&
      res.data.ParsedResults.length > 0
    ) {
      const ongaponga = res.data.ParsedResults[0];
      if (!ongaponga) {
        toast.error("Something went wrong");
        return;
      } else {
        if (ongaponga.ParsedText === "" || !ongaponga.ParsedText) {
          toast.error("Something went wrong");
          return;
        } else {
          toast.loading("Loading...");
          const airesult = await openAiCompletionFromImageMutation.mutateAsync({
            prompt: ongaponga.ParsedText,
          });
          if (airesult && airesult.text) {
            toast.dismiss();
            setIsLoading(false);
            setResult(airesult.text);
          } else {
            toast.dismiss();
            setIsLoading(false);
            toast.error("Something went wrong");
          }
        }
      }
    }
  }

  return (
    <>
      <Head>
        <title>Generic Medicine Alternative</title>
        <meta
          name="description"
          content="Find Generic Medicine Alternative for your Medications"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col">
        <div className="container mx-auto flex-1 px-4 py-8">
          <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight lg:text-5xl">
            Generic Medicine Alternative
          </h1>
          <br />
          <p className="scroll-m-20 text-center text-2xl tracking-tight">
            Find Generic Medicine Alternative for your Medications
          </p>

          <div className="mt-4 flex flex-col items-center">
            {selectedFile?.name && (
              <>
                <Image
                  src={URL.createObjectURL(selectedFile)}
                  alt="Selected File"
                  className="h-24 w-auto"
                  height={16}
                  width={16}
                />
                <span className="text-gray-500">{selectedFile?.name}</span>
              </>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <div className="w-full max-w-xl">
              <Input
                placeholder="Search for your Medication"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={!!selectedFile?.name}
              />
              <Button
                className="my-4 w-full"
                onClick={(e) => {
                  e.preventDefault();
                  // void onOpenAiCompletion();
                  if (!!selectedFile?.name) {
                    toast.loading("Uploading");
                    void ocrImage();
                  } else {
                    void onOpenAiCompletion();
                  }
                }}
                type="button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <SearchIcon className="mr-2 h-4 w-4" />
                )}{" "}
                Search
              </Button>
              <Dialog open={open}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full"
                    type="button"
                    variant="secondary"
                    disabled={isLoading}
                    onClick={() => setOpen(!open)}
                  >
                    {isLoading ? (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LucideUpload className="mr-2 h-4 w-4" />
                    )}{" "}
                    Upload
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Upload Image</DialogTitle>
                    <DialogDescription>Upload Image to parse</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex w-full flex-col py-4">
                      <div className="flex w-full cursor-pointer flex-col items-center rounded-lg border-4 border-dashed border-gray-300 p-4 hover:border-gray-400">
                        <Label htmlFor="fileInput">
                          <div>
                            {selectedFile?.name ? (
                              <div className="flex flex-col items-center">
                                <span className="text-gray-500">
                                  {selectedFile?.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-500">
                                Click or Drag to Upload
                              </span>
                            )}
                          </div>
                        </Label>
                        <Input
                          type="file"
                          id="fileInput"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        setOpen(!open);
                        setSelectedFile(null);
                      }}
                      type="button"
                      variant="outline"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        setOpen(!open);
                        void ocrImage();
                      }}
                      type="submit"
                    >
                      Submit
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {result && (
          <div className="container mx-auto w-full max-w-xl flex-1 px-4 py-8">
            <div className="rounded-md border-2 border-gray-400 p-4">
              <p className="text-center text-lg font-bold">{String(result)}</p>
            </div>
          </div>
        )}

        <footer className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={session?.user.image || ""} />
                <AvatarFallback>{initialsOfUser(session)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {session?.user.name}
                </span>
                <span className="text-sm font-medium text-gray-500">
                  {session?.user.email}
                </span>
              </div>

              <Button
                className="my-4"
                onClick={() => void signOut()}
                type="button"
                variant="secondary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4 rounded-full" />
                )}
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              &copy; 2023 Generic Medicine Alternative
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const user = await getServerAuthSession(ctx);
  if (!user) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
};
