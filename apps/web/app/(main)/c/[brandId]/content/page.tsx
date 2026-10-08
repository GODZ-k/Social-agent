import ContentPage from "@/modules/content/templates/content-page";
import React from "react";

function page(props: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ post?: string }>;
}) {
  return <ContentPage {...props} />;
}

export default page;
