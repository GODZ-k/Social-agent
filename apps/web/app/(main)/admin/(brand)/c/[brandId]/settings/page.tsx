import SettingsPage from '@/components/settings/setting-page'
import React from 'react'

function page(props: {
  params: Promise<{ brandId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  return (
    <SettingsPage {...props} />
  )
}

export default page