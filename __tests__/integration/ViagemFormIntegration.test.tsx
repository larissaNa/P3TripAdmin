import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ViagemForm } from '../../src/view/components/ViagemForm';
import { ViagemInput } from '../../src/model/entities/Viagem';
import userEvent from '@testing-library/user-event';

// Mock UI components that might be complex to render or not needed for integration logic
jest.mock('../../src/view/components/ui/calendar', () => ({
  Calendar: ({ selected, onSelect }: any) => (
    <div data-testid="mock-calendar">
      <button onClick={() => onSelect({ from: new Date(2023, 0, 1), to: new Date(2023, 0, 5) })}>
        Select Date
      </button>
    </div>
  )
}));

describe('Integration: View <-> ViewModel <-> Service (via Props)', () => {
  const mockOnSubmit = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should submit the form with correct data when inputs are filled', async () => {
    render(
      <ViagemForm 
        open={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    );

    // Fill inputs
    await userEvent.type(screen.getByLabelText(/Título/i), 'Viagem Teste');
    await userEvent.type(screen.getByLabelText(/Destino/i), 'Brasil');
    await userEvent.type(screen.getByLabelText(/Preço/i), '1000');
    await userEvent.type(screen.getByLabelText(/Descrição/i), 'Uma viagem legal');

    // Simulate Date Selection (triggering the mock calendar)
    // The popover trigger might need to be clicked first
    const dateButton = screen.getByText(/Selecione uma data/i); 
    fireEvent.click(dateButton);
    
    const selectDateBtn = screen.getByText('Select Date');
    fireEvent.click(selectDateBtn);

    // Submit
    const submitBtn = screen.getByText('Salvar');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    const expectedData: ViagemInput = {
      titulo: 'Viagem Teste',
      destino: 'Brasil',
      preco: 1000,
      descricao: 'Uma viagem legal',
      data_range: '01/01/2023 - 05/01/2023',
      dias: 4, // 01 to 05 is 4 days diff usually, or 5 inclusive depending on logic. 
      // The ViewModel logic: Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      // 5 Jan - 1 Jan = 4 days.
    };

    // Check first argument of first call
    const callArgs = mockOnSubmit.mock.calls[0];
    const submittedData = callArgs[0];
    
    expect(submittedData).toMatchObject({
        titulo: 'Viagem Teste',
        destino: 'Brasil',
        preco: 1000,
        descricao: 'Uma viagem legal',
        dias: 4
    });
    // Check date format specifically if needed
    expect(submittedData.data_range).toContain('2023'); 
  });
});
