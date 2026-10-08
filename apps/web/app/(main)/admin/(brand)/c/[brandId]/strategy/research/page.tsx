import StrategyResearchPage from '@/modules/strategy/templates/research-page';
import React from 'react'
import { routes } from "@/config/routes";
import type { WorkspaceBase } from "@/config/routes";

function page(props:{
  params: Promise<{ brandId: string }>;
  basePath?: WorkspaceBase;
}) {
  return (
    <StrategyResearchPage {...props} basePath={routes.admin.brand.base} />
  )
}

export default page