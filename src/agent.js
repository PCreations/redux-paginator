import agent from 'superagent'
import qs from 'query-string'

// based on http://stackoverflow.com/a/7616484/1836434
const hashUrl = (url) => {
  let hash = 0, i, chr, len
  if (url.length == 0) return hash
  for (i = 0, len = url.length; i < len; i++) {
    chr   = url.charCodeAt(i)
    hash  = ((hash << 5) - hash) + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

let _promises = {}

export const FROM_CACHE_FLAG = '@@redux-paginator/FROM_CACHE_FLAG'

export const buildSuffix = (pageArgName, page, params) => {
  const parsedParams = qs.parse(params)
  let finalParsedParams = {}
  let startString = ''
  for (let key of Object.keys(parsedParams)) {
    if (parsedParams[key] == null) {
      startString += key
    }
    else {
      finalParsedParams = {
        ...finalParsedParams,
        [key]: parsedParams[key]
      }
    }
  }
  startString = startString == '' ? '?' : startString + '?'

  if (Object.keys(finalParsedParams).length > 0 && qs.extract(params) != '') {
    startString = params.replace(qs.extract(params), '')
  }
  return startString+qs.stringify({
    ...finalParsedParams,
    [pageArgName]: page
  }, { encode: false }).replace(startString, '')
}

export const fetchPage = (endpoint, pageArgName, page, params, headers = {}) => {
  const suffix = buildSuffix(pageArgName, page, params)
  const url = endpoint + suffix
  const hash = hashUrl(url)
  let fromCache = true
  let promise = _promises[hash]
  if (typeof promise == 'undefined') {
    fromCache = false
    promise = new Promise((resolve, reject) =>
      agent
        .get(url)
        .set(headers)
        .end((err, res) => err ? reject(err) : resolve(res))
    )
    _promises[hash] = promise
  }

  return promise.then(res => fromCache ? {
    response: res.body,
    [FROM_CACHE_FLAG]: null
  } : { response: res.body })
}
