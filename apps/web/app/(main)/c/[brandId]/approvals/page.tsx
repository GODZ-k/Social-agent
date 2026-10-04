import ApprovalsPage from '@/components/approvals/approval-page';
import React from 'react'

function page(props: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ post?: string }>;
}) {
  return (
    <ApprovalsPage {...props}/>
  )
}

export default page