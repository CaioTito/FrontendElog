import axios from 'axios';
import type { OdometerRequest } from '../interfaces/request/odometerRequest';
import type { OdometerApiResponse } from '../interfaces/response/odometerResponse';


const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Busca dados do hodômetro da API.
 * @param params Parâmetros para a consulta do hodômetro.
 * @returns Uma Promise com os dados da resposta da API.
 */
export const fetchOdometerData = async (params: OdometerRequest): Promise<OdometerApiResponse> => {
  try {
    const response = await apiClient.get<OdometerApiResponse>('/odometer', { params });
    // Retorna diretamente os dados da resposta se a chamada for bem-sucedida
    // O chamador será responsável por verificar 'isSuccess' ou a estrutura dos dados
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar dados do hodômetro no serviço API:', error);
    // Em caso de erro, relança o erro para que o componente possa tratá-lo
    // ou retorna uma estrutura de erro padronizada, se preferir.
    throw error;
  }
};