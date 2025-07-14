import { promises as fs } from 'fs'
import path from 'path'
import type { Font, FontGroup } from 'shared'

interface DatabaseData {
  fonts: Font[]
  fontGroups: FontGroup[]
}

export class JsonDatabase {
  private static dbPath = path.join(process.cwd(), 'data', 'database.json')
  private static dataDir = path.join(process.cwd(), 'data')

  private static async ensureDataDirectory(): Promise<void> {
    try {
      await fs.access(this.dataDir)
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true })
    }
  }

  private static async ensureDatabase(): Promise<void> {
    await this.ensureDataDirectory()
    
    try {
      await fs.access(this.dbPath)
    } catch {
      // Create initial database file
      const initialData: DatabaseData = {
        fonts: [],
        fontGroups: []
      }
      await fs.writeFile(this.dbPath, JSON.stringify(initialData, null, 2))
    }
  }

  // Reads database content from JSON file
  static async read(): Promise<DatabaseData> {
    await this.ensureDatabase()
    
    try {
      const data = await fs.readFile(this.dbPath, 'utf-8')
      const parsed = JSON.parse(data)
      return parsed
    } catch {
      // Return empty data if file is corrupted
      return { fonts: [], fontGroups: [] }
    }
  }

  // Writes database content to JSON file
  static async write(data: DatabaseData): Promise<void> {
    await this.ensureDatabase()
    
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2))
    } catch {
      throw new Error('Failed to save data to database')
    }
  }

  // Font operations
  
  // Retrieves all fonts from the database
  static async getAllFonts(): Promise<Font[]> {
    const data = await this.read()
    return data.fonts
  }

  // Adds a new font to the database
  static async addFont(font: Font): Promise<void> {
    const data = await this.read()
    data.fonts.push(font)
    await this.write(data)
  }

  // Finds a font by its ID
  static async getFontById(id: string): Promise<Font | undefined> {
    const data = await this.read()
    return data.fonts.find(font => font.id === id)
  }

  // Deletes a font and removes it from all font groups
  static async deleteFont(id: string): Promise<boolean> {
    const data = await this.read()
    const fontIndex = data.fonts.findIndex(font => font.id === id)
    
    if (fontIndex === -1) return false
    
    // Remove font from fonts array
    data.fonts.splice(fontIndex, 1)
    
    // Remove font from all font groups
    data.fontGroups.forEach(group => {
      group.fonts = group.fonts.filter(font => font.id !== id)
    })
    
    await this.write(data)
    return true
  }

  // Font Group operations
  
  // Retrieves all font groups from the database
  static async getAllFontGroups(): Promise<FontGroup[]> {
    const data = await this.read()
    return data.fontGroups
  }

  // Adds a new font group to the database
  static async addFontGroup(fontGroup: FontGroup): Promise<void> {
    const data = await this.read()
    data.fontGroups.push(fontGroup)
    await this.write(data)
  }

  // Finds a font group by its ID
  static async getFontGroupById(id: string): Promise<FontGroup | undefined> {
    const data = await this.read()
    return data.fontGroups.find(group => group.id === id)
  }

  // Updates an existing font group in the database
  static async updateFontGroup(updatedGroup: FontGroup): Promise<boolean> {
    const data = await this.read()
    const groupIndex = data.fontGroups.findIndex(group => group.id === updatedGroup.id)
    
    if (groupIndex === -1) return false
    
    data.fontGroups[groupIndex] = updatedGroup
    await this.write(data)
    return true
  }

  // Deletes a font group from the database
  static async deleteFontGroup(id: string): Promise<boolean> {
    const data = await this.read()
    const groupIndex = data.fontGroups.findIndex(group => group.id === id)
    
    if (groupIndex === -1) return false
    
    data.fontGroups.splice(groupIndex, 1)
    await this.write(data)
    return true
  }

  // Utility methods
  
  // Creates a backup of the current database
  static async backup(): Promise<void> {
    const data = await this.read()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = path.join(this.dataDir, `database-backup-${timestamp}.json`)
    await fs.writeFile(backupPath, JSON.stringify(data, null, 2))
  }

  // Restores database from a backup file
  static async restore(backupFilePath: string): Promise<void> {
    const backupData = await fs.readFile(backupFilePath, 'utf-8')
    const data: DatabaseData = JSON.parse(backupData)
    await this.write(data)
  }
}
