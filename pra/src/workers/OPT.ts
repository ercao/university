//
// 最佳置换算法：每次选择淘汰的页面将是以后永不使用，或者在最长时间内不再被访问的页面，这样可以保证最低的缺页率
//
// 需要知道未来的页面请求序列
//

import { HeapPlus } from '../heapPlus.ts'
import { RequestType, ResponseType, compare } from '../utils.ts'
import { parentPort } from 'worker_threads'

parentPort?.on('message', <T>(req: RequestType<T>) => {
  const res: ResponseType<T>['res'] = []

  // index Map 记录每一页在未来请求序列中的下标
  const indexMap = new Map<T, { index: number; indices: number[] }>()
  req.pages.forEach((page, i) => {
    const index = indexMap.get(page)
    if (index !== undefined) {
      index.indices.push(i)
    } else {
      indexMap.set(page, { index: 1, indices: [i] })
    }
  })
  indexMap.forEach(({ indices }) => indices.push(Infinity))

  if (req.capacity > 0) {
    const heapPlus = new HeapPlus<
      { page: T; lessRight: number; time: number },
      T
    >(
      (node) => node.page,
      (n1, n2) => {
        const cmp = compare(n1.lessRight, n2.lessRight)
        return cmp === 0 ? compare(n2.time, n1.time) : cmp
      }
    )

    let time = 0

    for (let i = 0; i < req.pages.length; ++i) {
      let flag = false

      const page = req.pages[i]
      const indices = indexMap.get(page)!
      const lessRight = indices.indices[indices.index++]

      const index = heapPlus.indexOf(page)
      if (index === undefined) {
        flag = true

        // 是否需要换出
        if (heapPlus.length >= req.capacity) {
          // O(log(Capacity))
          heapPlus.remove(0)
        }

        // 寻找最近的
        heapPlus.add({ page, lessRight, time })
      } else {
        heapPlus.replace({ page, lessRight, time }, index)
      }

      ++time
      res.push({
        request: page,
        pages: [...heapPlus['_elements'].map((elem) => elem.page)],
        flag,
      })
    }
  }

  parentPort?.postMessage({ name: 'OPT 算法', req, res })
})
