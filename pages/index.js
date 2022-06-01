import Albums from '../components/albums'
import Hero from '../components/hero'
import Layout from '../components/layout'
import { getAllPostsForHome, getHeroPosts } from '../lib/api'
import Head from 'next/head'

export default function Index({ preview, allPosts, heroPost }) {
  return (
    <>
      <Layout preview={preview}>
        <Head>
          <title>Year In Music</title>
        </Head>
        {heroPost.title}
        <Hero />
          {allPosts.length > 0 && <Albums posts={allPosts} />}
      </Layout>
    </>
  )
}

export async function getStaticProps({ preview = false }) {
  const allPosts = (await getAllPostsForHome(preview)) ?? []
  const heroPost = (await getHeroPosts(preview)) ?? []
  return {
    props: { preview, allPosts, heroPost },
  }
}
