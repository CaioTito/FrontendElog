import axios, { AxiosError } from 'axios';
import type { OdometerRequest } from '../interfaces/request/odometerRequest';
import type { OdometerApiResponse } from '../interfaces/response/odometerResponse';
import { useNotifications } from '../composables/useNotifications';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Extrai uma mensagem de erro significativa de um erro de API (Axios).
 * @param error O erro da API, esperado ser um AxiosError.
 * @returns Um objeto com título e mensagem de erro.
 */
function extractErrorMessage(error: any): { title: string; message: string } {
    let title = 'Erro na Requisição';
    let message = 'Ocorreu um erro desconhecido ao processar sua solicitação.';
  
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
  
      if (status) {
        title = `Erro ${status}`;
        message =
          typeof data === 'string' ? data :
          data?.message ??
          data?.title ??
          data?.error ??
          error.message ??
          `O servidor respondeu com o status ${status}.`;
      } else if (error.request) {
        title = 'Erro de Conexão';
        message = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet ou tente novamente mais tarde.';
      } else {
        message = error.message || 'Erro ao configurar a requisição.';
      }
    } else if (error instanceof Error) {
      message = error.message;
    }
  
    return { title, message };
  }

/**
 * Manipulador de erro genérico para chamadas de API.
 * Extrai a mensagem, opcionalmente mostra uma notificação e relança o erro.
 * @param error O erro capturado.
 * @param showNotification Se uma notificação global deve ser mostrada. Padrão: true.
 */
function handleApiError(error: any, showNotification: boolean = true) {
  const { showError } = useNotifications();
  const { title, message } = extractErrorMessage(error);

  if (showNotification) {
    showError(title, message);
  }

  // Relança um erro padronizado ou o erro original para tratamento adicional se necessário
  // Poderia ser um objeto de erro customizado: throw new ApiError(title, message, error);
  console.error(`API Error: ${title} - ${message}`, error?.response?.data || error?.request || error);
  throw error; // Relança o erro original para que o componente chamador possa reagir se precisar
}

/**
 * Busca dados do hodômetro da API.
 * @param params Parâmetros para a consulta do hodômetro.
 * @returns Uma Promise com os dados da resposta da API.
 */
export const fetchOdometerData = async (params: OdometerRequest): Promise<OdometerApiResponse> => {
  try {
    const response = await apiClient.get<OdometerApiResponse>('/odometer', { params });
    return response.data;
  } catch (error) {
    handleApiError(error); 
    throw error; 
  }
};