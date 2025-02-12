import xss from 'xss-filters'

const clean = (data: any) => {
  let result: any
  if (typeof data === 'object') {
    const res = xss.inHTMLData(JSON.stringify(data)).trim()
    result = JSON.parse(res)
  } else {
    result = xss.inHTMLData(data)
  }

  return result
}

export default { clean }
