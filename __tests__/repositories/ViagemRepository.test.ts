import { ViagemRepository } from '../../src/model/repositories/ViagemRepository';
import { supabase } from '../../src/infra/supabase';
import { ViagemInput } from '../../src/model/entities/Viagem';

// Mock supabase
jest.mock('../../src/infra/supabase', () => ({
  supabase: {
    from: jest.fn(),
    storage: {
      from: jest.fn()
    }
  },
  BUCKET_NAME: 'test-bucket'
}));

describe('ViagemRepository', () => {
  const mockSupabase = supabase as unknown as { from: jest.Mock, storage: { from: jest.Mock } };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all trips', async () => {
      const mockData = [{ id: '1', titulo: 'Trip 1' }];
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null })
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await ViagemRepository.getAll();

      expect(mockSupabase.from).toHaveBeenCalledWith('viagem');
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockData);
    });

    it('should return empty array if data is null', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: null })
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await ViagemRepository.getAll();
      expect(result).toEqual([]);
    });

    it('should throw error on failure', async () => {
      const mockError = new Error('Database error');
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: mockError })
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await expect(ViagemRepository.getAll()).rejects.toThrow('Database error');
    });
  });

  describe('getById', () => {
    it('should return a trip by id', async () => {
      const mockData = { id: '1', titulo: 'Trip 1' };
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({ data: mockData, error: null })
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await ViagemRepository.getById('1');

      expect(mockSupabase.from).toHaveBeenCalledWith('viagem');
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual(mockData);
    });
  });

  describe('create', () => {
    it('should create a trip', async () => {
      const input: ViagemInput = {
          titulo: 'New Trip',
          destino: 'Somewhere',
          preco: 100,
          data_range: '2023-01-01',
          dias: 5
      };
      const mockData = { id: '1', ...input };
      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await ViagemRepository.create(input);

      expect(mockSupabase.from).toHaveBeenCalledWith('viagem');
      expect(mockChain.insert).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockData);
    });
  });

  describe('update', () => {
    it('should update a trip', async () => {
      const updateData = { titulo: 'Updated Trip' };
      const mockData = { id: '1', titulo: 'Updated Trip' };
      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null })
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await ViagemRepository.update('1', updateData);

      expect(mockSupabase.from).toHaveBeenCalledWith('viagem');
      expect(mockChain.update).toHaveBeenCalledWith(updateData);
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual(mockData);
    });
  });

  describe('delete', () => {
    it('should delete a trip', async () => {
      const mockChain = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null })
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await ViagemRepository.delete('1');

      expect(mockSupabase.from).toHaveBeenCalledWith('viagem');
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.eq).toHaveBeenCalledWith('id', '1');
    });
  });

  describe('uploadImages', () => {
    it('should upload images and return urls', async () => {
        const file = new File([''], 'test.png', { type: 'image/png' });
        const mockStorageFrom = {
            upload: jest.fn().mockResolvedValue({ error: null }),
            getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'http://test.com/img.png' } })
        };
        mockSupabase.storage.from.mockReturnValue(mockStorageFrom);

        const result = await ViagemRepository.uploadImages([file], '123');

        expect(mockSupabase.storage.from).toHaveBeenCalledWith('test-bucket');
        expect(mockStorageFrom.upload).toHaveBeenCalled();
        expect(mockStorageFrom.getPublicUrl).toHaveBeenCalled();
        expect(result).toEqual(['http://test.com/img.png']);
    });
  });

  describe('deleteImages', () => {
      it('should delete images', async () => {
          const mockStorageFrom = {
              remove: jest.fn().mockResolvedValue({ error: null })
          };
          mockSupabase.storage.from.mockReturnValue(mockStorageFrom);

          await ViagemRepository.deleteImages(['http://test.com/test-bucket/path/to/img.png']);

          expect(mockSupabase.storage.from).toHaveBeenCalledWith('test-bucket');
          expect(mockStorageFrom.remove).toHaveBeenCalledWith(['path/to/img.png']);
      });

      it('should do nothing if imageUrls is empty', async () => {
          const mockStorageFrom = {
              remove: jest.fn()
          };
          mockSupabase.storage.from.mockReturnValue(mockStorageFrom);

          await ViagemRepository.deleteImages([]);

          expect(mockStorageFrom.remove).not.toHaveBeenCalled();
      });
  });
});
