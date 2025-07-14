import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/bun'
import type { ApiResponse } from 'shared/dist'
import { FontService } from './services/fontService'

const app = new Hono()

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Serve uploaded fonts statically
app.use('/uploads/*', serveStatic({ root: './' }))

app.get('/', (c) => {
  return c.text('Font Group System API')
})

app.get('/hello', async (c) => {
  const data: ApiResponse = {
    message: "Hello BHVR!",
    success: true
  }

  return c.json(data, { status: 200 })
})

// Font upload endpoint - handles TTF file uploads with validation
app.post('/api/fonts/upload', async (c) => {
  try {
    const body = await c.req.parseBody()
    
    const file = body['font'] as File
    
    if (!file) {
      return c.json({
        success: false,
        message: 'No file uploaded'
      } as ApiResponse, 400)
    }
    
    // Check if file is TTF
    if (!file.name.toLowerCase().endsWith('.ttf')) {
      return c.json({
        success: false,
        message: 'Only TTF files are allowed'
      } as ApiResponse, 400)
    }
    
    const font = await FontService.saveFont(file, file.name)
    
    return c.json({
      success: true,
      message: 'Font uploaded successfully',
      data: font
    } as ApiResponse, 201)
  } catch (error) {
    return c.json({
      success: false,
      message: 'Failed to upload font: ' + (error instanceof Error ? error.message : 'Unknown error')
    } as ApiResponse, 500)
  }
})

// Get all fonts endpoint
app.get('/api/fonts', async (c) => {
  try {
    const fonts = await FontService.getAllFonts()
    return c.json({
      success: true,
      message: 'Fonts retrieved successfully',
      data: fonts
    } as ApiResponse)
  } catch {
    return c.json({
      success: false,
      message: 'Failed to retrieve fonts'
    } as ApiResponse, 500)
  }
})

// Delete font endpoint - removes font file and database entry
app.delete('/api/fonts/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const deleted = await FontService.deleteFont(id)
    
    if (!deleted) {
      return c.json({
        success: false,
        message: 'Font not found'
      } as ApiResponse, 404)
    }
    
    return c.json({
      success: true,
      message: 'Font deleted successfully'
    } as ApiResponse)
  } catch {
    return c.json({
      success: false,
      message: 'Failed to delete font'
    } as ApiResponse, 500)
  }
})

// Create font group endpoint - creates a new font group with multiple fonts
app.post('/api/font-groups', async (c) => {
  try {
    const body = await c.req.json()
    const fontGroup = await FontService.createFontGroup(body)
    
    if (!fontGroup) {
      return c.json({
        success: false,
        message: 'Font group must have at least 2 fonts'
      } as ApiResponse, 400)
    }
    
    return c.json({
      success: true,
      message: 'Font group created successfully',
      data: fontGroup
    } as ApiResponse, 201)
  } catch {
    return c.json({
      success: false,
      message: 'Failed to create font group'
    } as ApiResponse, 500)
  }
})

// Get all font groups endpoint
app.get('/api/font-groups', async (c) => {
  try {
    const fontGroups = await FontService.getAllFontGroups()
    return c.json({
      success: true,
      message: 'Font groups retrieved successfully',
      data: fontGroups
    } as ApiResponse)
  } catch {
    return c.json({
      success: false,
      message: 'Failed to retrieve font groups'
    } as ApiResponse, 500)
  }
})

// Update font group endpoint - updates an existing font group
app.put('/api/font-groups/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const updateRequest = { ...body, id }
    
    const fontGroup = await FontService.updateFontGroup(updateRequest)
    
    if (!fontGroup) {
      return c.json({
        success: false,
        message: 'Font group not found or invalid data'
      } as ApiResponse, 400)
    }
    
    return c.json({
      success: true,
      message: 'Font group updated successfully',
      data: fontGroup
    } as ApiResponse)
  } catch {
    return c.json({
      success: false,
      message: 'Failed to update font group'
    } as ApiResponse, 500)
  }
})

// Delete font group endpoint - removes a font group from the database
app.delete('/api/font-groups/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const deleted = await FontService.deleteFontGroup(id)
    
    if (!deleted) {
      return c.json({
        success: false,
        message: 'Font group not found'
      } as ApiResponse, 404)
    }
    
    return c.json({
      success: true,
      message: 'Font group deleted successfully'
    } as ApiResponse)
  } catch {
    return c.json({
      success: false,
      message: 'Failed to delete font group'
    } as ApiResponse, 500)
  }
})

export default app
