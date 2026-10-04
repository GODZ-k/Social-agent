import StrategyResearchPage from '@/components/strategy/research/research-page';
import { WorkspaceBasePath } from '@/lib/workspace-path';
import React from 'react'

function page(props:{
  params: Promise<{ brandId: string }>;
  basePath?: WorkspaceBasePath;
}) {
  return (
    <StrategyResearchPage {...props} basePath='/admin/c' />
  )
}

export default page