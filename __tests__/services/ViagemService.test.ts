import { ViagemService } from '../../src/model/services/ViagemService';
import { ViagemRepository } from '../../src/model/repositories/ViagemRepository';

jest.mock('@/infra/supabase', () => ({
  supabase: {},
  BUCKET_NAME: 'test'
}));

jest.mock('../../src/model/repositories/ViagemRepository');

describe('ViagemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listar', () => {
    it('should call ViagemRepository.getAll', async () => {
      await ViagemService.listar();
      expect(ViagemRepository.getAll).toHaveBeenCalled();
    });
  });

  describe('criar', () => {
      it('should create trip and upload images if files provided', async () => {
          const input = { titulo: 'Trip' } as any;
          const files = [new File([''], 'test.png')];
          const mockCreatedTrip = { id: '1', ...input };
          const mockImages = ['url1'];
          const mockFinalTrip = { ...mockCreatedTrip, imagens: mockImages };

          (ViagemRepository.create as jest.Mock).mockResolvedValue(mockCreatedTrip);
          (ViagemRepository.uploadImages as jest.Mock).mockResolvedValue(mockImages);
          (ViagemRepository.update as jest.Mock).mockResolvedValue(mockFinalTrip);

          const result = await ViagemService.criar(input, files);

          expect(ViagemRepository.create).toHaveBeenCalledWith({ ...input, imagens: [] });
          expect(ViagemRepository.uploadImages).toHaveBeenCalledWith(files, '1');
          expect(ViagemRepository.update).toHaveBeenCalledWith('1', { imagens: mockImages });
          expect(result).toEqual(mockFinalTrip);
      });

       it('should create trip without images if no files provided', async () => {
          const input = { titulo: 'Trip' } as any;
          const files: File[] = [];
          const mockCreatedTrip = { id: '1', ...input };
          const mockFinalTrip = { ...mockCreatedTrip, imagens: [] };

          (ViagemRepository.create as jest.Mock).mockResolvedValue(mockCreatedTrip);
          (ViagemRepository.update as jest.Mock).mockResolvedValue(mockFinalTrip);

          const result = await ViagemService.criar(input, files);

          expect(ViagemRepository.create).toHaveBeenCalledWith({ ...input, imagens: [] });
          expect(ViagemRepository.uploadImages).not.toHaveBeenCalled();
          expect(ViagemRepository.update).toHaveBeenCalledWith('1', { imagens: [] });
      });
  });

  describe('atualizar', () => {
      it('should update trip and append new images', async () => {
          const id = '1';
          const updateData = { titulo: 'Updated' };
          const newFiles = [new File([''], 'new.png')];
          const currentTrip = { id, imagens: ['old.png'] };
          const newImages = ['new.png'];
          const finalImages = ['old.png', 'new.png'];
          const finalTrip = { ...currentTrip, ...updateData, imagens: finalImages };

          (ViagemRepository.getById as jest.Mock).mockResolvedValue(currentTrip);
          (ViagemRepository.uploadImages as jest.Mock).mockResolvedValue(newImages);
          (ViagemRepository.update as jest.Mock).mockResolvedValue(finalTrip);

          const result = await ViagemService.atualizar(id, updateData, newFiles);

          expect(ViagemRepository.getById).toHaveBeenCalledWith(id);
          expect(ViagemRepository.uploadImages).toHaveBeenCalledWith(newFiles, id);
          expect(ViagemRepository.update).toHaveBeenCalledWith(id, { ...updateData, imagens: finalImages });
          expect(result).toEqual(finalTrip);
      });
  });

  describe('excluir', () => {
      it('should delete images and trip', async () => {
          const id = '1';
          const trip = { id, imagens: ['img1.png'] };

          (ViagemRepository.getById as jest.Mock).mockResolvedValue(trip);
          (ViagemRepository.deleteImages as jest.Mock).mockResolvedValue(undefined);
          (ViagemRepository.delete as jest.Mock).mockResolvedValue(undefined);

          await ViagemService.excluir(id);

          expect(ViagemRepository.getById).toHaveBeenCalledWith(id);
          expect(ViagemRepository.deleteImages).toHaveBeenCalledWith(['img1.png']);
          expect(ViagemRepository.delete).toHaveBeenCalledWith(id);
      });
  });

  describe('filtrar', () => {
      it('should filter by destination', () => {
          const trips = [
              { id: '1', destino: 'Paris', preco: 100 } as any,
              { id: '2', destino: 'London', preco: 200 } as any
          ];
          const result = ViagemService.filtrar(trips, { destino: 'Paris' });
          expect(result).toHaveLength(1);
          expect(result[0].id).toBe('1');
      });

      it('should filter by price range', () => {
          const trips = [
              { id: '1', destino: 'Paris', preco: 100 } as any,
              { id: '2', destino: 'London', preco: 200 } as any,
              { id: '3', destino: 'Rome', preco: 300 } as any
          ];
          const result = ViagemService.filtrar(trips, { precoMin: 150, precoMax: 250 });
          expect(result).toHaveLength(1);
          expect(result[0].id).toBe('2');
      });
  });
});
