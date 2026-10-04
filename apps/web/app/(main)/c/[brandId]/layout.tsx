import WorkspaceLayout from '@/components/common/workspace-layout'
import React from 'react'

function layout(props:{
  children: React.ReactNode;
  params: Promise<{ brandId: string }>;
}) {
  return (
    <WorkspaceLayout {...props}/>
  )
}

export default layout