import { redirect } from "next/navigation";

export default function OldProfileRedirect({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/profile/${params.slug}`, 301);
}

