'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarAlt, faChartLine, faTasks, faLink, faCheck, faEdit, faSave, faPlus, faTrash, faChartBar, faUserCog } from '@fortawesome/free-solid-svg-icons'
import { Tajawal } from 'next/font/google'

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '700'],
})

const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
const dayEmojis = ['🌅', '☀️', '🌙', '🌟', '🌈', '🌞', '🕌']

const taskColors = [
  { light: 'bg-blue-100', dark: 'bg-blue-300' },
  { light: 'bg-green-100', dark: 'bg-green-300' },
  { light: 'bg-yellow-100', dark: 'bg-yellow-300' },
  { light: 'bg-purple-100', dark: 'bg-purple-300' },
  { light: 'bg-pink-100', dark: 'bg-pink-300' },
  { light: 'bg-indigo-100', dark: 'bg-indigo-300' },
  { light: 'bg-red-100', dark: 'bg-red-300' },
]

const statisticsColors = [
  'bg-blue-50',
  'bg-green-50',
  'bg-yellow-50',
  'bg-purple-50',
  'bg-pink-50',
  'bg-indigo-50',
  'bg-red-50'
]

type Task = {
  id: string;
  category: string;
  text: string;
  completed: boolean;
}

type DayData = {
  tasks: Task[];
  link: string;
  emoji: string;
}

type TasksData = Record<string, DayData>

export default function Component() {
  const [tasksData, setTasksData] = useState<TasksData>({})
  const [activeDay, setActiveDay] = useState(days[0])
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [tempLink, setTempLink] = useState('')
  const [editingTask, setEditingTask] = useState<{ day: string; index: number; field: 'text' | 'category' } | null>(null)
  const [showStatistics, setShowStatistics] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showSecretButton, setShowSecretButton] = useState(false)

  useEffect(() => {
    const savedTasks = localStorage.getItem('englishLearningTasks')
    if (savedTasks) {
      try {
        setTasksData(JSON.parse(savedTasks))
      } catch (error) {
        console.error('Error parsing saved tasks:', error)
        initializeDefaultTasks()
      }
    } else {
      initializeDefaultTasks()
    }
  }, [])

  const initializeDefaultTasks = useCallback(() => {
    const initialData: TasksData = {}
    days.forEach((day, index) => {
      initialData[day] = {
        tasks: [
          { id: `task-${day}-0`, category: 'مهمة جديدة', text: 'أضف مهمة جديدة', completed: false }
        ],
        link: '',
        emoji: dayEmojis[index]
      }
    })
    setTasksData(initialData)
  }, [])

  useEffect(() => {
    localStorage.setItem('englishLearningTasks', JSON.stringify(tasksData))
  }, [tasksData])

  const calculateDailyProgress = useCallback((day: string) => {
    const tasks = tasksData[day]?.tasks || []
    const completedTasks = tasks.filter((task: Task) => task.completed).length
    return tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
  }, [tasksData])

  const calculateWeeklyProgress = useMemo(() => {
    let totalTasks = 0
    let completedTasks = 0
    Object.values(tasksData).forEach(dayData => {
      totalTasks += dayData.tasks.length
      completedTasks += dayData.tasks.filter(task => task.completed).length
    })
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }, [tasksData])

  const toggleTask = useCallback((day: string, index: number) => {
    setTasksData(prev => {
      const newData = { ...prev }
      if (newData[day] && newData[day].tasks[index]) {
        newData[day].tasks[index].completed = !newData[day].tasks[index].completed
        if (newData[day].tasks[index].completed) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          })
        }
      }
      return newData
    })
  }, [])

  const editTask = useCallback((day: string, index: number, field: 'text' | 'category', value: string) => {
    if (!isAdmin) return
    setTasksData(prev => {
      const newData = { ...prev }
      if (newData[day] && newData[day].tasks[index]) {
        newData[day].tasks[index][field] = value
      }
      return newData
    })
  }, [isAdmin])

  const saveLink = useCallback(() => {
    if (!isAdmin) return
    if (tempLink) {
      setTasksData(prev => ({
        ...prev,
        [activeDay]: {
          ...prev[activeDay],
          link: tempLink
        }
      }))
      setShowLinkInput(false)
      setTempLink('')
    }
  }, [isAdmin, activeDay, tempLink])

  const deleteLink = useCallback(() => {
    if (!isAdmin) return
    setTasksData(prev => ({
      ...prev,
      [activeDay]: {
        ...prev[activeDay],
        link: ''
      }
    }))
  }, [isAdmin, activeDay])

  const addTask = useCallback(() => {
    if (!isAdmin) return
    setTasksData(prev => {
      const newData = { ...prev }
      const newTaskId = `task-${activeDay}-${newData[activeDay].tasks.length}`
      newData[activeDay].tasks.push({
        id: newTaskId,
        category: 'مهمة جديدة',
        text: 'أضف مهمة جديدة',
        completed: false
      })
      return newData
    })
  }, [isAdmin, activeDay])

  const deleteTask = useCallback((day: string, index: number) => {
    if (!isAdmin) return
    setTasksData(prev => {
      const newData = { ...prev }
      if (newData[day] && newData[day].tasks[index]) {
        newData[day].tasks.splice(index, 1)
      }
      return newData
    })
  }, [isAdmin])

  const toggleAdminMode = useCallback(() => {
    setIsAdmin(prev => !prev)
  }, [])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'a') {
      event.preventDefault()
      setShowSecretButton(true)
      setTimeout(() => setShowSecretButton(false), 5000)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  const secretAdminToggle = useCallback(() => {
    setIsAdmin(true)
    setShowSecretButton(false)
  }, [])

  return (
    <div className={`container mx-auto p-4 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen ${tajawal.className}`} dir="rtl">
      <motion.h1 
        className="text-xl font-bold text-center mb-4 text-blue-900 drop-shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        جدول المهام الأسبوعي لتعلم اللغة الإنجليزية
        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-blue-900" />
      </motion.h1>
      
      <div className="flex justify-between items-center mb-4">
        <AnimatePresence>
          {isAdmin && (
            <motion.button
              className="px-4 py-2 rounded-full text-sm font-bold focus:outline-none transition-colors duration-300 bg-blue-500 text-white"
              onClick={toggleAdminMode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              مشرف
              <FontAwesomeIcon icon={faUserCog} className="mr-2" />
            </motion.button>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showSecretButton && (
            <motion.button
              className="px-4 py-2 rounded-full text-sm font-bold focus:outline-none transition-colors duration-300 bg-red-500 text-white"
              onClick={secretAdminToggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              تفعيل وضع المشرف
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <motion.div 
        className="flex mb-4 overflow-x-auto pb-2 scrollbar-hide"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {days.map((day, index) => (
          <motion.button
            key={day}
            className={`flex-shrink-0 px-4 py-2 rounded-full mr-2 text-sm font-bold focus:outline-none transition-colors duration-300 ${
              activeDay === day ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-100'
            }`}
            onClick={() => setActiveDay(day)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {day} {tasksData[day]?.emoji}
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeDay}
          className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <h2 className="text-xl font-bold mb-4 text-blue-800">{activeDay}</h2>
          
          <motion.div 
            className="bg-blue-50 rounded-xl p-3 mb-4 shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
          >
            <h3 className="text-lg font-bold mb-2 text-blue-800 flex items-center">
              تقدم اليوم
              <FontAwesomeIcon icon={faChartLine} className="mr-2  text-blue-600" />
            </h3>
            <div className="relative pt-1">
              <div className="overflow-hidden h-4 mb-2 text-xs flex rounded-full bg-green-100">
                <motion.div 
                  style={{ width: `${calculateDailyProgress(activeDay)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-600 to-green-300"
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateDailyProgress(activeDay)}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="text-center">
                <span className="text-sm font-bold text-green-800">
                  <span  className="mr-1">{calculateDailyProgress(activeDay)}%</span>
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-purple-50 rounded-xl p-3 mb-4  shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
          >
            <h3  className="text-lg font-bold mb-2 text-purple-800 flex items-center">
              المهام
              <FontAwesomeIcon icon={faTasks} className="mr-2 text-purple-600" />
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <AnimatePresence>
                {tasksData[activeDay]?.tasks.map((task: Task, index: number) => (
                  <motion.div
                    key={task.id}
                    className={`p-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${task.completed ? taskColors[index % taskColors.length].dark : taskColors[index %   taskColors.length].light}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    layout
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex-grow">
                        {isAdmin && editingTask?.day === activeDay && editingTask?.index === index && editingTask?.field === 'category' ? (
                          <input
                            type="text"
                            value={task.category}
                            onChange={(e) => editTask(activeDay, index, 'category', e.target.value)}
                            onBlur={() => setEditingTask(null)}
                            autoFocus
                            className="w-full p-1 text-sm rounded bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 text-purple-800"
                          />
                        ) : (
                          <span 
                            className={`font-bold text-sm text-purple-800 ${isAdmin ? 'cursor-pointer' : ''} truncate block`}
                            onClick={() => isAdmin && setEditingTask({ day: activeDay, index, field: 'category' })}
                          >
                            {task.category}
                          </span>
                        )}
                      </div>
                      {isAdmin && (
                        <motion.button
                          className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-500 transition-colors duration-200"
                          onClick={() => deleteTask(activeDay, index)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                        </motion.button>
                      )}
                    </div>
                    {isAdmin && editingTask?.day === activeDay && editingTask?.index === index && editingTask?.field === 'text' ? (
                      <input
                        type="text"
                        value={task.text}
                        onChange={(e) => editTask(activeDay, index, 'text', e.target.value)}
                        onBlur={() => setEditingTask(null)}
                        autoFocus
                        className="w-full p-1 text-sm rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-800"
                      />
                    ) : (
                      <div
                        className={`w-full p-1 text-sm rounded bg-white bg-opacity-50 text-blue-800 ${isAdmin ? 'cursor-pointer' : ''} truncate`}
                        onClick={() => isAdmin && setEditingTask({ day: activeDay, index, field: 'text' })}
                      >
                        {task.text}
                      </div>
                    )}
                    <div className="flex items-center mt-1 justify-end">
                      <span className="text-sm text-gray-600 ml-1">
                        {task.completed ? 'مكتملة' : 'غير مكتملة'}
                      </span>
                      <motion.div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-400'} cursor-pointer`}
                        onClick={() => toggleTask(activeDay, index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        animate={{ backgroundColor: task.completed ? '#10B981' : '#FFFFFF' }}
                        transition={{ duration: 0.2 }}
                      >
                        {task.completed && (
                          <FontAwesomeIcon icon={faCheck} className="text-white text-sm" />
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {isAdmin && (
              <motion.button
                className="mt-3 bg-gradient-to-r from-purple-400 to-pink-500 text-white px-3 py-1 rounded-full text-sm hover:from-purple-500 hover:to-pink-600 transition-all duration-300"
                onClick={addTask}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                إضافة مهمة جديدة
                <FontAwesomeIcon icon={faPlus} className="mr-1" />
              </motion.button>
            )}
          </motion.div>

          <motion.div 
            className="bg-pink-50 rounded-xl p-3 mb-4 shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
          >
            <h3 className="text-lg font-bold mb-2 text-pink-800 flex items-center">
              الروابط
              <FontAwesomeIcon icon={faLink} className="mr-2 text-pink-600" />
            </h3>
            {isAdmin && !showLinkInput && !tasksData[activeDay]?.link && (
              <motion.button
                className="bg-gradient-to-r from-pink-400 to-red-500 text-white px-3 py-1 rounded-full text-sm hover:from-pink-500 hover:to-red-600 transition-all duration-300"
                onClick={() => setShowLinkInput(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                إضافة رابط
                <FontAwesomeIcon icon={faPlus} className="mr-1" />
              </motion.button>
            )}
            <AnimatePresence>
              {showLinkInput && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col sm:flex-row items-center mt-2"
                >
                  <input
                    type="text"
                    value={tempLink}
                    onChange={(e) => setTempLink(e.target.value)}
                    placeholder="أدخل الرابط هنا..."
                    className="flex-grow p-2 text-sm rounded-lg border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300 w-full sm:w-auto mb-2 sm:mb-0"
                  />
                  <motion.button
                    className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-lg text-sm hover:from-pink-600 hover:to-red-600 transition-all duration-300 sm:mr-2 w-full sm:w-auto"
                    onClick={saveLink}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    حفظ
                    <FontAwesomeIcon icon={faSave} className="mr-1" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
            {tasksData[activeDay]?.link && (
              <div className="flex flex-wrap items-center mt-2 space-y-2 sm:space-y-0 sm:space-x-2 rtl:space-x-reverse">
                <motion.a 
                  href={tasksData[activeDay].link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-gradient-to-r from-blue-400 to-blue-600 text-white px-2 py-1 rounded-full text-sm hover:from-blue-500 hover:to-blue-700 transition-all duration-300 w-full sm:w-auto justify-center sm:justify-start"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  فتح الرابط
                  <FontAwesomeIcon icon={faLink} className="mr-1" />
                </motion.a>
                {isAdmin && (
                  <>
                    <motion.button
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1 rounded-full text-sm hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 w-full sm:w-auto"
                      onClick={() => setShowLinkInput(true)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      تغيير
                      <FontAwesomeIcon icon={faEdit} className="mr-1" />
                    </motion.button>
                    <motion.button
                      className="bg-gradient-to-r from-red-400 to-red-600 text-white px-2 py-1 rounded-full text-sm hover:from-red-500 hover:to-red-700 transition-all duration-300 w-full sm:w-auto"
                      onClick={deleteLink}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      حذف
                      <FontAwesomeIcon icon={faTrash} className="mr-1" />
                    </motion.button>
                  </>
                )}
              </div>
            )}
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-3 shadow-md hover:shadow-lg transition-shadow duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3, ease: "easeOut" }}
          >
            <motion.h2
              className="text-lg font-bold mb-2 text-blue-800 cursor-pointer flex items-center"
              onClick={() => setShowStatistics(!showStatistics)}
              whileHover={{ scale: 1.05 }}
            >
              الإحصائيات
              <FontAwesomeIcon icon={faChartBar} className="mr-2" />
              <motion.span
                initial={{ rotate: 0 }}
                animate={{ rotate: showStatistics ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="mr-2"
              >
                ▼
              </motion.span>
            </motion.h2>
            <AnimatePresence>
              {showStatistics && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-3">
                    <h3 className="text-md font-bold mb-1 text-blue-700">التقدم الأسبوعي</h3>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-4 mb-2 text-xs flex rounded-full bg-blue-200">
                        <motion.div 
                          style={{ width: `${calculateWeeklyProgress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-purple-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${calculateWeeklyProgress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-bold text-blue-800">
                          {calculateWeeklyProgress}% مكتمل
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {days.map((day, index) => (
                      <motion.div
                        key={day}
                        className={`p-2 rounded-lg shadow-sm ${statisticsColors[index]}`}
                        whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                      >
                        <h4 className="text-sm font-bold mb-1 text-blue-700">{day}</h4>
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-3 mb-1 text-xs flex rounded-full bg-blue-200">
                            <motion.div 
                              style={{ width: `${calculateDailyProgress(day)}%` }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-400 to-blue-500"
                              initial={{ width: 0 }}
                              animate={{ width: `${calculateDailyProgress(day)}%`  }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <div className="text-center">
                            <span className="text-xs font-bold text-blue-800">
                              {calculateDailyProgress(day)}% مكتمل
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}