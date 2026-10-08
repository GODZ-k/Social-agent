import SettingsPage from '@/modules/settings/templates/setting-page'
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