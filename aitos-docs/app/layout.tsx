import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import Image from 'next/image'
 
export const metadata = {
  title: 'AITOS Documentation',
  description: 'Documentation for the AITOS multi-agent framework',
  openGraph: {
    title: 'AITOS Documentation',
    description: 'Documentation for the AITOS multi-agent framework',
    type: 'website'
  }
}
 
const navbar = (
  <Navbar
    logo={<Image  src='/aitos.png' alt='A' width={30} height={30}/>}
    projectLink='https://github.com/aitosLove/aitos-public'
    
  />
)
const footer = <Footer>Copyright © {new Date().getFullYear()} AITOS</Footer>
 
export default async function RootLayout({ children }:{ children: React.ReactNode }) {
  return (
    <html
      // Not required, but good for SEO
      lang="en"
      // Required to be set
      dir="ltr"
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
    >
      <Head
      // ... Your additional head options
      >
        {/* Your additional tags should be passed as `children` of `<Head>` element */}
      </Head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/yourusername/aitos"
          footer={footer}
          // AITOS documentation layout
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}