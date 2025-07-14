import { useState, useEffect } from 'react'
import type { Font, FontGroup } from 'shared'
import { FontUploadForm } from './components/FontUploadForm'
import { FontList } from './components/FontList'
import { FontGroupForm } from './components/FontGroupForm'
import { FontGroupList } from './components/FontGroupList'
import './App.css'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000"

function App() {
  const [fonts, setFonts] = useState<Font[]>([])
  const [fontGroups, setFontGroups] = useState<FontGroup[]>([])
  const [editingGroup, setEditingGroup] = useState<FontGroup | null>(null)

  const loadFonts = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/fonts`)
      const data = await response.json()
      if (data.success) {
        setFonts(data.data)
      }
    } catch (error) {
      console.error('Error loading fonts:', error)
    }
  }

  const loadFontGroups = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/font-groups`)
      const data = await response.json()
      if (data.success) {
        setFontGroups(data.data)
      }
    } catch (error) {
      console.error('Error loading font groups:', error)
    }
  }

  const handleFontUploaded = (font: Font) => {
    setFonts(prev => [...prev, font])
  }

  const handleFontDeleted = (fontId: string) => {
    setFonts(prev => prev.filter(f => f.id !== fontId))
  }

  const handleFontGroupCreated = (fontGroup: FontGroup) => {
    setFontGroups(prev => [...prev, fontGroup])
  }

  const handleFontGroupUpdated = (fontGroup: FontGroup) => {
    setFontGroups(prev => 
      prev.map(fg => fg.id === fontGroup.id ? fontGroup : fg)
    )
    setEditingGroup(null)
  }

  const handleFontGroupDeleted = (groupId: string) => {
    setFontGroups(prev => prev.filter(fg => fg.id !== groupId))
  }

  const handleEditGroup = (group: FontGroup) => {
    setEditingGroup(group)
  }

  const handleCancelEdit = () => {
    setEditingGroup(null)
  }

  useEffect(() => {
    loadFonts()
    loadFontGroups()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Font Group System</h1>
          <p className="text-gray-600">Upload fonts and create font groups for your projects</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Font Upload and Font List */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Font</h2>
              <FontUploadForm 
                serverUrl={SERVER_URL} 
                onFontUploaded={handleFontUploaded}
              />
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Font Library</h2>
              <FontList 
                fonts={fonts}
                serverUrl={SERVER_URL}
                onFontDeleted={handleFontDeleted}
              />
            </section>
          </div>

          {/* Right Column - Font Groups */}
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {editingGroup ? 'Edit Font Group' : 'Create Font Group'}
              </h2>
              <FontGroupForm 
                fonts={fonts}
                serverUrl={SERVER_URL}
                onFontGroupCreated={handleFontGroupCreated}
                onFontGroupUpdated={handleFontGroupUpdated}
                editingGroup={editingGroup}
                onCancelEdit={handleCancelEdit}
              />
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Font Groups</h2>
              <FontGroupList 
                fontGroups={fontGroups}
                serverUrl={SERVER_URL}
                onFontGroupDeleted={handleFontGroupDeleted}
                onEditGroup={handleEditGroup}
              />
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
