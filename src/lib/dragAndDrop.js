import { arrayMove } from '@dnd-kit/sortable';
import { LIST_CONFIG } from '@/lib/constants';

const findList = (lists, id) => {
  if (id in lists) {
    return id;
  }
  return Object.keys(lists).find((key) => lists[key].some(movie => movie.id === id));
}

export const debounceDragOver = (func, wait = 10) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const moveOverflow = (lists) => {
  if (lists.FAVORITE.length > LIST_CONFIG.FAVORITE.limit) {
    const overflowCount = lists.FAVORITE.length - LIST_CONFIG.FAVORITE.limit;
    const overflow = lists.FAVORITE.splice(-overflowCount, overflowCount);
    lists = {
      ...lists,
      FAVORITE: lists.FAVORITE,
      HM: [...overflow, ...lists.HM]
    };
  }

  if (lists.HM.length > LIST_CONFIG.HM.limit) {
    const overflowCount = lists.HM.length - LIST_CONFIG.HM.limit;
    const overflow = lists.HM.splice(-overflowCount, overflowCount);
    lists = {
      ...lists,
      HM: lists.HM,
      QUEUE: [...overflow, ...lists.HM]
    };
  }

  return lists;
}

export const handleDragStart = ({event, setActiveId, lists, setActiveList}) => {
  setActiveId(event.active.id);
  const activeList = findList(lists, event.active.id);
  setActiveList(activeList);
}

export const handleDragOver = ({event, lists, setLists, setActiveDropzone}) => {
  const {active: {id: activeId}, over} = event;
  const overId = over.id

  const activeList = findList(lists, activeId);
  const overList = findList(lists, overId);

  if (!activeList || !overList || activeList === overList) {
    return;
  }
  setActiveDropzone(overList);

  const activeMovies = lists[activeList];
  const overMovies = lists[overList];

  const activeIndex = activeMovies.findIndex(movie => movie.id === activeId);
  const overIndex = overMovies.findIndex(movie => movie.id === overId);

  let newIndex;
  if (overId in lists) {
    newIndex = overMovies.length + 1;
  } else {
    const isBelowLastItem = over && overIndex === overMovies.length - 1;
    const modifier = isBelowLastItem ? 1 : 0;
    newIndex = overIndex >= 0 ? overIndex + modifier : overMovies.length + 1;
  }

  const newLists = {
    ...lists,
    [activeList]: [
      ...lists[activeList].filter((movie) => movie.id !== activeId)
    ],
    [overList]: [
      ...lists[overList].slice(0, newIndex),
      lists[activeList][activeIndex],
      ...lists[overList].slice(newIndex, lists[overList].length)
    ]
  };

  setLists(newLists);
}

export const handleDragEnd = ({event, lists, setLists, setActiveId, setActiveDropzone, setActiveList, saveListsToDb}) => {
  const { active: {id: activeId}, over: {id: overId} } = event;
  const activeList = findList(lists, activeId);
  const overList = findList(lists, overId);
  const activeIndex = lists[activeList].findIndex(movie => movie.id === activeId);
  const overIndex = lists[overList].findIndex(movie => movie.id === overId);
  let newLists = (activeList && overList && activeList === overList && activeIndex !== overIndex) ?
    {
      ...lists,
      [overList]: arrayMove(lists[overList], activeIndex, overIndex)
    }
  : lists

  const cleanedLists = moveOverflow(newLists);
  setLists(cleanedLists);
  saveListsToDb(cleanedLists);

  setActiveDropzone(null);
  setActiveList(null);
  setActiveId(null);
};

