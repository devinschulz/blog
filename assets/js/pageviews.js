let {pathname} = window.location

// Firestore cannot use / as a document name, so be explicit about what / means.
if (pathname === '/') {
  pathname = '/home'
}

// Remove all slashes
pathname = pathname.replaceAll(/\//g, '')

fetch(`/api/view?page=${pathname}`).catch((e) => console.error(e))
