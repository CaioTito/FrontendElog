import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import type { OdometerRequest } from '../interfaces/request/odometerRequest';
import type { OdometerApiResponse } from '../interfaces/response/odometerResponse';
import { useNotifications } from '../composables/useNotifications';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: params => {
    const parts: string[] = [];
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || typeof value === 'undefined') {
        return;
      }
      if (Array.isArray(value)) {
        if (value.length === 0) return;

        value.forEach(val => {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
        });
      } else {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value as string | number | boolean)}`);
      }
    });
    return parts.join('&');
  }
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
      const axiosError = error as AxiosError<any>;
      if (axiosError.response) {
        const status = axiosError.response.status;
        const responseData = axiosError.response.data;
        title = `Erro ${status}`;
  
        if (typeof responseData === 'string') {
          message = responseData;
        } else if (responseData && typeof responseData.message === 'string') {
          message = responseData.message;
        } else if (responseData && typeof responseData.title === 'string') {
          message = responseData.title; 
        } else if (responseData && typeof responseData.error === 'string') {
          message = responseData.error;
        } else if (axiosError.message) {
          message = axiosError.message;
        } else {
          message = `O servidor respondeu com o status ${status}.`;
        }
      } else if (axiosError.request) {
        title = 'Erro de Conexão';
        message = 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet ou tente novamente mais tarde.';
      } else {
        message = axiosError.message || 'Erro ao configurar a requisição.';
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