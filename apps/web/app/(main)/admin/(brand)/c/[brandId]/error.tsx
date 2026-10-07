"use client"
import WorkspaceError from '@/components/workspace/workspace-error'
import React from 'react'

function error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <WorkspaceError {...props}/>
  )
}

export default error