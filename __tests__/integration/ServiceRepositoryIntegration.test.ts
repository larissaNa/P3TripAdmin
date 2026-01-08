import { ViagemService } from '../../src/model/services/ViagemService';
import { ViagemRepository } from '../../src/model/repositories/ViagemRepository';
import { supabase } from '../../src/infra/supabase';

// Mock supabase only (Infrastructure Layer)
jest.mock('../../src/infra/supabase', () => ({
  supabase: {
    from: jest.fn(),
    storage: {
      from: jest.fn()
    }
  },
  BUCKET_NAME: 'test-bucket'
}));

describe('Integration: Service <-> Repository', () => {
  const mockSupabase = supabase as unknown as { from: jest.Mock, storage: { from: jest.Mock } };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call repository methods which call supabase correctly when creating a trip', async () => {
    // Arrange
    const input = {
      titulo: 'Integration Trip',
      destino: 'World',
      preco: 500,
      data_range: '2023-01-01',
      dias: 10
    };
    const files = [new File([''], 'photo.jpg', { type: 'image/jpeg' })];

    // Mock Supabase responses for the chain of calls
    
    // 1. Create trip (Insert)
    const mockInsertChain = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ 
        data: { id: '123', ...input, imagens: [] }, 
        error: null 
      })
    };

    // 2. Upload images (Storage)
    const mockStorageChain = {
      upload: jest.fn().mockResolvedValue({ error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'http://img.com/photo.jpg' } })
    };

    // 3. Update trip with images (Update)
    const mockUpdateChain = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ 
        data: { id: '123', ...input, imagens: ['http://img.com/photo.jpg'] }, 
        error: null 
      })
    };

    // Setup mock implementation
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'viagem') {
        // We need to return different chains based on the operation, but since jest mocks are usually static or sequential,
        // we can use mockReturnValueOnce or simple logic.
        // However, Repository creates a new chain each time.
        // Let's use a dynamic mock that returns a "Super Chain" or sequence.
        return {
           insert: mockInsertChain.insert,
           select: mockInsertChain.select, // Shared select mock
           single: mockInsertChain.single, // Shared single mock
           update: mockUpdateChain.update,
           eq: mockUpdateChain.eq,
        };
      }
      return {};
    });

    // We need to be careful because `create` calls `insert` then `select` then `single`.
    // And `update` calls `update` then `eq` then `select` then `single`.
    // The simplified mock above might mix them up. 
    // Let's use `mockReturnValueOnce` on `supabase.from`.

    // Call 1: Repository.create -> supabase.from('viagem')
    mockSupabase.from.mockReturnValueOnce(mockInsertChain);
    
    // Call 2: Repository.uploadImages -> supabase.storage.from(...)
    mockSupabase.storage.from.mockReturnValue(mockStorageChain);

    // Call 3: Repository.update -> supabase.from('viagem')
    mockSupabase.from.mockReturnValueOnce(mockUpdateChain);


    // Act
    // We are calling the Real Service, which calls the Real Repository
    const result = await ViagemService.criar(input, files);

    // Assert
    // Check if Service logic flowed correctly into Repository and then to Supabase
    
    // 1. Insert was called
    expect(mockSupabase.from).toHaveBeenNthCalledWith(1, 'viagem');
    expect(mockInsertChain.insert).toHaveBeenCalledWith(expect.objectContaining({ titulo: 'Integration Trip' }));

    // 2. Upload was called
    expect(mockSupabase.storage.from).toHaveBeenCalledWith('test-bucket');
    expect(mockStorageChain.upload).toHaveBeenCalled();

    // 3. Update was called with new image
    expect(mockSupabase.from).toHaveBeenNthCalledWith(2, 'viagem');
    expect(mockUpdateChain.update).toHaveBeenCalledWith(expect.objectContaining({ 
      imagens: ['http://img.com/photo.jpg'] 
    }));
    expect(mockUpdateChain.eq).toHaveBeenCalledWith('id', '123');

    // Check final result
    expect(result.imagens).toEqual(['http://img.com/photo.jpg']);
  });
});
