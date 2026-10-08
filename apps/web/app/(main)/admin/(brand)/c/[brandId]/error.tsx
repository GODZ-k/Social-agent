"use client"
import WorkspaceError from '@/modules/shell/components/workspace-error'
import React from 'react'

function error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <WorkspaceError {...props}/>
  )
}

export default error