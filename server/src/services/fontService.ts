import type { Font, FontGroup, CreateFontGroupRequest, UpdateFontGroupRequest } from 'shared'
import { v4 as uuidv4 } from 'uuid'
import { promises as fs } from 'fs'
import path from 'path'
import { JsonDatabase } from './jsonDatabase'

export class FontService {
  // Saves an uploaded font file to disk and adds it to the database
  static async saveFont(file: File, originalName: string): Promise<Font> {
    const id = uuidv4()
    const filename = `${id}.ttf`
    const uploadPath = path.join(process.cwd(), 'uploads', filename)
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads')
    try {
      await fs.access(uploadsDir)
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true })
    }
    
    // Save file - handle both File and Blob types
    let buffer: ArrayBuffer
    if (file.arrayBuffer) {
      buffer = await file.arrayBuffer()
    } else if (file.stream) {
      // Handle if it's a different type of file object
      const chunks: Uint8Array[] = []
      const reader = file.stream().getReader()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
      
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      const result = new Uint8Array(totalLength)
      let offset = 0
      for (const chunk of chunks) {
        result.set(chunk, offset)
        offset += chunk.length
      }
      buffer = result.buffer
    } else {
      throw new Error('Invalid file type')
    }
    
    await fs.writeFile(uploadPath, Buffer.from(buffer))
    
    const font: Font = {
      id,
      name: originalName.replace(/\.ttf$/i, ''),
      filename,
      originalName,
      path: `/uploads/${filename}`,
      uploadedAt: new Date()
    }
    
    // Save to JSON database
    await JsonDatabase.addFont(font)
    return font
  }
  
  // Retrieves all fonts from the database
  static async getAllFonts(): Promise<Font[]> {
    return await JsonDatabase.getAllFonts()
  }
  
  static async getFontById(id: string): Promise<Font | undefined> {
    return await JsonDatabase.getFontById(id)
  }
  
  // Deletes a font from both file system and database
  static async deleteFont(id: string): Promise<boolean> {
    const font = await JsonDatabase.getFontById(id)
    if (!font) return false
    
    // Delete physical file
    const filePath = path.join(process.cwd(), 'uploads', font.filename)
    try {
      await fs.unlink(filePath)
    } catch {
      // Continue with database deletion even if file deletion fails
    }
    
    // Delete from JSON database
    return await JsonDatabase.deleteFont(id)
  }
  
  // Creates a new font group with selected fonts (minimum 2 fonts required)
  static async createFontGroup(request: CreateFontGroupRequest): Promise<FontGroup | null> {
    if (request.fontIds.length < 2) {
      return null // Must have at least 2 fonts
    }
    
    // Get fonts from database
    const allFonts = await JsonDatabase.getAllFonts()
    const selectedFonts = request.fontIds
      .map(id => allFonts.find(font => font.id === id))
      .filter((font): font is Font => font !== undefined)
    
    if (selectedFonts.length !== request.fontIds.length) {
      return null // Some fonts not found
    }
    
    const fontGroup: FontGroup = {
      id: uuidv4(),
      name: request.name,
      fonts: selectedFonts,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await JsonDatabase.addFontGroup(fontGroup)
    return fontGroup
  }
  
  // Retrieves all font groups from the database
  static async getAllFontGroups(): Promise<FontGroup[]> {
    return await JsonDatabase.getAllFontGroups()
  }
  
  // Retrieves a specific font group by ID
  static async getFontGroupById(id: string): Promise<FontGroup | undefined> {
    return await JsonDatabase.getFontGroupById(id)
  }
  
  // Updates an existing font group with new data
  static async updateFontGroup(request: UpdateFontGroupRequest): Promise<FontGroup | null> {
    const existingGroup = await JsonDatabase.getFontGroupById(request.id)
    if (!existingGroup) return null
    
    if (request.fontIds.length < 2) {
      return null // Must have at least 2 fonts
    }
    
    // Get fonts from database
    const allFonts = await JsonDatabase.getAllFonts()
    const selectedFonts = request.fontIds
      .map(id => allFonts.find(font => font.id === id))
      .filter((font): font is Font => font !== undefined)
    
    if (selectedFonts.length !== request.fontIds.length) {
      return null // Some fonts not found
    }
    
    const updatedGroup: FontGroup = {
      ...existingGroup,
      name: request.name,
      fonts: selectedFonts,
      updatedAt: new Date()
    }
    
    const success = await JsonDatabase.updateFontGroup(updatedGroup)
    return success ? updatedGroup : null
  }
  
  // Deletes a font group from the database
  static async deleteFontGroup(id: string): Promise<boolean> {
    return await JsonDatabase.deleteFontGroup(id)
  }
}
