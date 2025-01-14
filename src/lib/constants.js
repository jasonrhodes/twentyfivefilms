export const MAX_IMPORT_COUNT = 500;
export const INVALID_URL_ERROR = 'Invalid URL';
export const INITIAL_LISTS = {
  FAVORITE: [],
  HM: [],
  QUEUE: []
}
export const LIST_CONFIG = {
  FAVORITE: {
    label: 'Top 10',
    description: 'Unranked, equally weighted',
    limit: 10,
  },
  HM: {
    label: '15 Honorable Mentions',
    description: 'Unranked, weighted less than Top 10',
    limit: 15
  },
  QUEUE: {
    label: 'Overflow',
    description: "Uncounted movies that don't fit in your Top 10 or Honorable Mentions. Drag them up if you want to include them"
  }
}