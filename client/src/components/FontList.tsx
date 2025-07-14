import { useEffect } from 'react'
import type { Font } from 'shared'
import { Button } from './ui/button'

interface FontListProps {
  fonts: Font[]
  serverUrl: string
  onFontDeleted: (fontId: string) => void
}

export function FontList({ fonts, serverUrl, onFontDeleted }: FontListProps) {
  
  // Load fonts dynamically
  useEffect(() => {
    fonts.forEach((font) => {
      const fontFace = new FontFace(
        `font-${font.id}`, 
        `url(${serverUrl}${font.path})`
      )
      
      fontFace.load().then(() => {
        document.fonts.add(fontFace)
      }).catch((error) => {
        console.error(`Failed to load font ${font.name}:`, error)
      })
    })
  }, [fonts, serverUrl])

  const handleDelete = async (fontId: string) => {
    if (!confirm('Are you sure you want to delete this font?')) {
      return
    }

    try {
      const response = await fetch(`${serverUrl}/api/fonts/${fontId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        onFontDeleted(fontId)
      } else {
        alert('Failed to delete font')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete font')
    }
  }

  if (fonts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-white border border-gray-200 rounded-lg">
        <p>No fonts uploaded yet.</p>
        <p className="text-sm">Upload your first TTF font to get started!</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Our Fonts</h3>
        <p className="text-sm text-gray-600 mt-1">Browse a list of Zepto fonts to build your font group.</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Font Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preview
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fonts.map((font) => (
              <tr key={font.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{font.name}</div>
                  <div className="text-sm text-gray-500">{font.originalName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div 
                    className="text-lg text-gray-700"
                    style={{ 
                      fontFamily: `font-${font.id}, serif`,
                      fontWeight: 'normal'
                    }}
                  >
                    Example Style
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(font.id)}
                    
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
