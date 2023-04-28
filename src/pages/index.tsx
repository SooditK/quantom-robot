import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { initialsOfUser } from "@/lib/initials";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/utils/api";
import { SearchIcon, X } from "lucide-react";
import { type GetServerSideProps, type NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";
import { toast } from "react-hot-toast";

const Home: NextPage = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const openAiCompletionMutation = api.openai.textCompletion.useMutation();
  const { data: session, status } = useSession();
  const [prompt, setPrompt] = useState<string>("");
  const [result, setResult] = useState<string>("");
  if (status === "loading") {
    return <div>Loading...</div>;
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

          <div className="mt-8 flex justify-center">
            <div className="w-full max-w-xl">
              <Input
                placeholder="Search for your Medication"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button
                className="my-4 w-full"
                onClick={(e) => {
                  e.preventDefault();
                  void onOpenAiCompletion();
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
