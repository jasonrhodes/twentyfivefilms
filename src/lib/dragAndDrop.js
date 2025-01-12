import { arrayMove } from '@dnd-kit/sortable';
import { LIST_CONFIG } from '@/lib/constants';

const findList = (lists, id) => {
  if (id in lists) {
    return id;
  }
  return Object.keys(lists).find((key) => lists[key].some(movie => movie.id === id));
}

export const debounceDragOver = (func, wait = 10) => {
  let timeout; // for the setTimeout function and so it can be cleared
  return function executedFunction(...args) { // the function returned from debounce
    const later = () => { // this is the delayed function
      clearTimeout(timeout); // clears the timeout when the function is called
      func(...args); // calls the function
    };
    clearTimeout(timeout); // this clears the timeout each time the function is run again preventing later from running until we stop calling the function
    timeout = setTimeout(later, wait); // this sets the time out to run after the wait period
  };
};

const moveOverflow = (lists) => {
  const overFlowingListType = Object.keys(LIST_CONFIG)
    .find((listType) => LIST_CONFIG[listType].limit && lists[listType].length > LIST_CONFIG[listType].limit);

  if (overFlowingListType) {
    let overflowingList = lists[overFlowingListType]
    const overflowCount = lists[overFlowingListType].length - LIST_CONFIG[overFlowingListType].limit
    const overflow = overflowingList.splice(-overflowCount, overflowCount)

    return {
      ...lists,
      [overFlowingListType]: overflowingList,
      QUEUE: [...overflow, ...lists.QUEUE]
    };
  } else {
    return lists;
  }
}

export const handleDragStart = ({event, setActiveId, lists, setActiveList}) => {
  setActiveId(event.active.id);
  const activeList = findList(lists, event.active.id);
  setActiveList(activeList);
}

export const handleDragOver = ({event, lists, setLists, setActiveDropzone, setActiveList}) => {
  const {active: {id: activeId}, over} = event;
  console.log(event)
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
    // We're at the root droppable of a list
    newIndex = overMovies.length + 1;
  } else {
    const isBelowLastItem =
      over &&
      overIndex === overMovies.length - 1;

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

  console.log({lists, newLists})

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

