import type { FontGroup } from 'shared'
import { Button } from './ui/button'

interface FontGroupListProps {
  fontGroups: FontGroup[]
  serverUrl: string
  onFontGroupDeleted: (groupId: string) => void
  onEditGroup: (group: FontGroup) => void
}

export function FontGroupList({ 
  fontGroups, 
  serverUrl, 
  onFontGroupDeleted, 
  onEditGroup 
}: FontGroupListProps) {
  const handleDelete = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this font group?')) {
      return
    }

    try {
      const response = await fetch(`${serverUrl}/api/font-groups/${groupId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        onFontGroupDeleted(groupId)
      } else {
        alert('Failed to delete font group')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete font group')
    }
  }

  const handlePreview = (group: FontGroup) => {
    const previewText = 'The quick brown fox jumps over the lazy dog'
    
    // Create a new window for preview
    const previewWindow = window.open('', '_blank', 'width=1000,height=600')
    if (previewWindow) {
      const fontStyles = group.fonts.map((font, index) => `
        @font-face {
          font-family: 'PreviewFont${index}';
          src: url('${serverUrl}${font.path}') format('truetype');
        }
      `).join('\n')

      const fontPreviews = group.fonts.map((font, index) => `
        <div class="font-preview-item">
          <h3>${font.name}</h3>
          <div class="font-preview font-${index}">${previewText}</div>
        </div>
      `).join('\n')

      const fontClasses = group.fonts.map((_, index) => `
        .font-${index} {
          font-family: 'PreviewFont${index}', serif;
        }
      `).join('\n')

      previewWindow.document.write(`
        <html>
          <head>
            <title>Font Group Preview: ${group.name}</title>
            <style>
              ${fontStyles}
              
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                background: #f5f5f5;
                margin: 0;
              }
              .preview-container {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                max-width: 900px;
                margin: 0 auto;
              }
              .font-preview-item {
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #eee;
              }
              .font-preview-item:last-child {
                border-bottom: none;
              }
              .font-preview-item h3 {
                margin: 0 0 10px 0;
                color: #333;
                font-size: 16px;
              }
              .font-preview {
                font-size: 24px;
                line-height: 1.4;
                color: #333;
                padding: 15px;
                background: #fafafa;
                border-radius: 4px;
              }
              .group-info {
                color: #666;
                font-size: 14px;
                border-top: 1px solid #eee;
                padding-top: 15px;
                margin-top: 20px;
              }
              ${fontClasses}
            </style>
          </head>
          <body>
            <div class="preview-container">
              <h1>Font Group: ${group.name}</h1>
              ${fontPreviews}
              <div class="group-info">
                <strong>Fonts in this group:</strong> ${group.fonts.length}<br>
                <strong>Created:</strong> ${new Date(group.createdAt).toLocaleDateString()}<br>
                <strong>Last Updated:</strong> ${new Date(group.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </body>
        </html>
      `)
      previewWindow.document.close()
    }
  }

  if (fontGroups.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No font groups created yet.</p>
        <p className="text-sm">Create your first font group to organize your fonts!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {fontGroups.map((group) => (
        <div
          key={group.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">{group.name}</h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">
                  {group.fonts.length} fonts in this group:
                </p>
                <div className="flex flex-wrap gap-1">
                  {group.fonts.map((font) => (
                    <span
                      key={font.id}
                      className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                    >
                      {font.name}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Created {new Date(group.createdAt).toLocaleDateString()}
                {group.updatedAt !== group.createdAt && (
                  <span> • Updated {new Date(group.updatedAt).toLocaleDateString()}</span>
                )}
              </p>
            </div>
            <div className="flex space-x-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreview(group)}
              >
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditGroup(group)}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(group.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
