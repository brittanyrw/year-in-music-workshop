const POST_GRAPHQL_FIELDS = `
sys {
  id
}
name
slug
albumCover {
  url
  description
}
releaseYear
artistName
favoriteMonth
mood
type
language
thoughts {
  json
  links {
    assets {
      block {
        sys {
          id
        }
        url
        description
      }
    }
  }
}
`

const HERO_GRAPHQL_QUERY = `
  pageTitle
  introduction
`

async function fetchGraphQL(query, preview = false) {
  return fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${
          preview
            ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
            : process.env.CONTENTFUL_ACCESS_TOKEN
        }`,
      },
      body: JSON.stringify({ query }),
    }
  ).then((response) => response.json())
}

function extractPost(fetchResponse) {
  return fetchResponse?.data?.albumCollection?.items?.[0]
}

function extractPostEntries(fetchResponse) {
  return fetchResponse?.data?.albumCollection?.items
}

function extractHeroEntries(fetchResponse) {
  return fetchResponse?.data?.heroCollection?.items?.[0]
}

export async function getPreviewPostBySlug(slug) {
  const entry = await fetchGraphQL(
    `query {
      albumCollection(where: { slug: "${slug}" }, order: favoriteMonth_ASC, preview: true, limit: 1) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
    true
  )
  return extractPost(entry)
}

export async function getAllPostsWithSlug() {
  const entries = await fetchGraphQL(
    `query {
      albumCollection(where: { slug_exists: true }) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`
  )
  return extractPostEntries(entries)
}

export async function getAllPostsForHome(preview) {
  const entries = await fetchGraphQL(
    `query {
      albumCollection(preview: ${preview ? 'true' : 'false'}, order: favoriteMonth_ASC,) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
    preview
  )
  return extractPostEntries(entries)
}

export async function getHeroPosts(preview) {
  const entries = await fetchGraphQL(
    `query {
      heroCollection(preview: ${preview ? 'true' : 'false'}) {
        items {
          ${HERO_GRAPHQL_QUERY}
        }
      }
    }`,
    preview
  )
  return extractHeroEntries(entries)
}

export async function getPostAndMorePosts(slug, preview) {
  const entry = await fetchGraphQL(
    `query {
      albumCollection(where: { slug: "${slug}" }, preview: ${
      preview ? 'true' : 'false'
    }, limit: 1) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
    preview
  )
  const entries = await fetchGraphQL(
    `query {
      albumCollection(where: { slug_not_in: "${slug}" }, order: favoriteMonth_ASC, preview: ${
      preview ? 'true' : 'false'
    }, limit: 3) {
        items {
          ${POST_GRAPHQL_FIELDS}
        }
      }
    }`,
    preview
  )
  return {
    post: extractPost(entry),
    morePosts: extractPostEntries(entries),
  }
}
