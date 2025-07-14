import { useState, useEffect } from 'react'
import type { Font, FontGroup, CreateFontGroupRequest, UpdateFontGroupRequest } from 'shared'
import { Button } from './ui/button'

interface FontRow {
  id: string
  fontName: string
  selectedFontId: string
  specificSize: string
  priceChange: string
}

interface FontGroupFormProps {
  fonts: Font[]
  serverUrl: string
  onFontGroupCreated: (fontGroup: FontGroup) => void
  onFontGroupUpdated: (fontGroup: FontGroup) => void
  editingGroup: FontGroup | null
  onCancelEdit: () => void
}

export function FontGroupForm({ 
  fonts, 
  serverUrl, 
  onFontGroupCreated, 
  onFontGroupUpdated,
  editingGroup,
  onCancelEdit
}: FontGroupFormProps) {
  const [groupName, setGroupName] = useState('')
  const [fontRows, setFontRows] = useState<FontRow[]>([
    {
      id: '1',
      fontName: '',
      selectedFontId: '',
      specificSize: '1.00',
      priceChange: '0'
    }
  ])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (editingGroup) {
      setGroupName(editingGroup.name)
      setFontRows(editingGroup.fonts.map((font, index) => ({
        id: (index + 1).toString(),
        fontName: font.name,
        selectedFontId: font.id,
        specificSize: '1.00',
        priceChange: '0'
      })))
    } else {
      setGroupName('')
      setFontRows([{
        id: '1',
        fontName: '',
        selectedFontId: '',
        specificSize: '1.00',
        priceChange: '0'
      }])
    }
    setMessage('')
  }, [editingGroup])

  // Adds a new empty font row to the form
  const addRow = () => {
    const newId = (fontRows.length + 1).toString()
    setFontRows([...fontRows, {
      id: newId,
      fontName: '',
      selectedFontId: '',
      specificSize: '1.00',
      priceChange: '0'
    }])
  }

  // Removes a font row from the form (minimum 1 row must remain)
  const removeRow = (id: string) => {
    if (fontRows.length > 1) {
      setFontRows(fontRows.filter(row => row.id !== id))
    }
  }

  // Updates a specific field in a font row by row ID
  const updateRow = (id: string, field: keyof FontRow, value: string) => {
    setFontRows(prevRows => 
      prevRows.map(row => 
        row.id === id ? { ...row, [field]: value } : row
      )
    )
  }

  // Handles font selection from dropdown and updates both font ID and name
  const handleFontSelection = (id: string, fontId: string) => {
    const selectedFont = fonts.find(f => f.id === fontId)
    
    if (selectedFont) {
      updateRow(id, 'selectedFontId', fontId)
      updateRow(id, 'fontName', selectedFont.name)
    } else if (!fontId) {
      // Clear the font selection when "Select a Font" is chosen
      updateRow(id, 'selectedFontId', '')
      updateRow(id, 'fontName', '')
    }
  }

  // Handles form submission for creating or updating font groups
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!groupName.trim()) {
      setMessage('Please enter a group name')
      return
    }

    // Get all rows with valid font selections
    const validRows = fontRows.filter(row => 
      row.selectedFontId && row.selectedFontId !== ''
    )

    if (validRows.length < 2) {
      setMessage('Please select at least 2 fonts')
      return
    }

    // Check for duplicate font selections
    const selectedFontIds = validRows.map(row => row.selectedFontId)
    const uniqueFontIds = [...new Set(selectedFontIds)]
    
    if (uniqueFontIds.length !== selectedFontIds.length) {
      setMessage('Please select different fonts (no duplicates allowed)')
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      const isEditing = !!editingGroup
      const url = isEditing 
        ? `${serverUrl}/api/font-groups/${editingGroup.id}`
        : `${serverUrl}/api/font-groups`
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const requestBody: CreateFontGroupRequest | UpdateFontGroupRequest = {
        name: groupName.trim(),
        fontIds: uniqueFontIds,
        ...(isEditing && { id: editingGroup.id })
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (data.success) {
        setMessage(`Font group ${isEditing ? 'updated' : 'created'} successfully!`)
        if (isEditing) {
          onFontGroupUpdated(data.data)
        } else {
          onFontGroupCreated(data.data)
        }
        
        // Reset form only when creating new group
        if (!isEditing) {
          setGroupName('')
          setFontRows([{
            id: '1',
            fontName: '',
            selectedFontId: '',
            specificSize: '1.00',
            priceChange: '0'
          }])
        }
      } else {
        setMessage(data.message || `Failed to ${isEditing ? 'update' : 'create'} font group`)
      }
    } catch {
      setMessage(`Failed to ${editingGroup ? 'update' : 'create'} font group`)
    } finally {
      setSubmitting(false)
    }
  }

  // Cancels editing mode and resets the form
  const handleCancel = () => {
    onCancelEdit()
    setGroupName('')
    setFontRows([{
      id: '1',
      fontName: '',
      selectedFontId: '',
      specificSize: '1.00',
      priceChange: '0'
    }])
    setMessage('')
  }

  if (fonts.length === 0) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-yellow-900 mb-2">No Fonts Available</h3>
        <p className="text-yellow-800">Upload at least 2 fonts before creating a font group.</p>
      </div>
    )
  }

  // Counts how many rows have valid font selections (required for form validation)
  const validRowCount = fontRows.filter(row => {
    return row.selectedFontId && row.selectedFontId !== ''
  }).length

  // Check if form is ready for submission (has group name and at least 2 fonts selected)
  const isFormValid = groupName.trim() !== '' && validRowCount >= 2

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Group Name */}
        <div>
          <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-2">
            Group Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Group Title"
            required
          />
        </div>

        {/* Validation Info */}
        <div className={`p-3 rounded-lg border-l-4 text-sm ${
          isFormValid 
            ? 'bg-green-50 border-green-400 text-green-800' 
            : 'bg-amber-50 border-amber-400 text-amber-800'
        }`}>
          {!groupName.trim() 
            ? '⚠ Please enter a group name/title'
            : validRowCount < 2
              ? `⚠ You have to select at least two fonts (${validRowCount}/2 completed)`
              : `✓ Ready to ${editingGroup ? 'update' : 'create'} group with ${validRowCount} fonts`
          }
        </div>

        {/* Font Rows */}
        <div className="space-y-3">
          {fontRows.map((row, index) => (
            <div key={row.id} className="grid grid-cols-12 gap-3 items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              {/* Row Number */}
              <div className="col-span-1 flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                </div>
              </div>

              {/* Font Name */}
              <div className="col-span-3">
                <input
                  type="text"
                  value={row.fontName}
                  onChange={(e) => updateRow(row.id, 'fontName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Font Name"
                  readOnly
                />
              </div>

              {/* Font Selection */}
              <div className="col-span-3">
                <div className="relative">
                  <select
                    value={row.selectedFontId}
                    onChange={(e) => handleFontSelection(row.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white"
                  >
                    <option value="">Select a Font</option>
                    {fonts.map((font) => (
                      <option key={font.id} value={font.id}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Specific Size */}
              <div className="col-span-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={row.specificSize}
                  onChange={(e) => updateRow(row.id, 'specificSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="1.00"
                />
              </div>

              {/* Price Change */}
              <div className="col-span-2">
                <input
                  type="number"
                  step="0.01"
                  value={row.priceChange}
                  onChange={(e) => updateRow(row.id, 'priceChange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="0"
                />
              </div>

              {/* Remove Button */}
              <div className="col-span-1 flex justify-center">
                {fontRows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors text-lg font-bold"
                    title="Remove this font"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Row Button */}
        <div className="flex justify-start">
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            + Add Row
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {editingGroup && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={submitting || !isFormValid}
            className={`px-8 py-2 font-medium rounded-md transition-colors ${
              submitting || !isFormValid
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {submitting 
              ? (editingGroup ? 'Updating...' : 'Creating...')
              : (editingGroup ? 'Update' : 'Create')
            }
          </Button>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-3 rounded-md ${
            message.includes('successfully') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}
