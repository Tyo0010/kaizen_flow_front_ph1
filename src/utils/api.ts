// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// ========================================
// SESSION ISSUES API INTERFACES
// ========================================

export interface SessionVerificationIssue {
    affectedItems: string[]
    issue: string
    sourceDocument: string
}

export interface SessionIssuesResponse {
    session_id: string
    session_info: {
        session_status: string
        format_validation_enabled: boolean
        total_documents: number
        successful_documents: number
        failed_documents: number
        created_at: string
        updated_at: string
    }
    session_issues?: SessionVerificationIssue[] | {
        cancelled_at?: string
        cancelled_by?: string
        reason?: string
        total_refund?: number
        documents_cancelled?: number
    } | null
    document_issues: Array<{
        document_id: string
        document_name: string
        original_filename: string
        processing_status: string
        error_message?: string | null
        file_type: string
        file_size: number
        created_at: string
    }>
    has_issues: boolean
    issue_summary: {
        session_level_issues: number
        document_level_issues: number
        total_failed_documents: number
    }
}

// Helper function to get auth headers
export const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
        throw new Error('No access token found')
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
}

// Helper function to handle API responses
export const handleApiResponse = async (response: Response) => {
    if (!response.ok) {
        if (response.status === 401) {
            // Token expired, clear storage and redirect to login
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            window.location.href = '/'
            throw new Error('Session expired. Please login again.')
        }
        
        if (response.status === 404) {
            const errorData = await response.json().catch(() => ({ error: 'Resource not found' }))
            // Check for specific session-related 404 errors
            if (errorData.error === 'Session not found') {
                throw new Error('Session not found. The session may have expired or been deleted.')
            }
            if (errorData.error === 'Upload session not found') {
                throw new Error('Upload session not found. Please try uploading again.')
            }
            throw new Error(errorData.error || errorData.message || 'Resource not found')
        }
        
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || errorData.message || 'Request failed')
    }
    
    return response.json()
}

// Check if uploading pages would exceed monthly limit
export const checkUsageLimit = async (pages: number) => {
    console.log('Calling checkUsageLimit with pages:', pages)
    console.log('API URL:', `${API_BASE_URL}/documents/usage/check`)
    
    const response = await fetch(`${API_BASE_URL}/documents/usage/check`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ pages })
    })
    
    console.log('Usage check response status:', response.status)
    const result = await handleApiResponse(response)
    console.log('Usage check result:', result)
    
    return result
}

// Get current company's usage stats and subscription limits
export const getUsageStats = async () => {
    const response = await fetch(`${API_BASE_URL}/documents/usage`, {
        method: 'GET',
        headers: getAuthHeaders()
    })
    
    return handleApiResponse(response)
}

// Upload files and return session ID
export const uploadFiles = async (files: File[], outputFormat: string, documentName?: string) => {
    console.log('Starting uploadFiles function')
    console.log('Files:', files.map(f => ({ name: f.name, size: f.size, type: f.type })))
    console.log('Output format:', outputFormat)
    console.log('API URL:', `${API_BASE_URL}/documents/upload`)
    
    const formData = new FormData()
    
    // Use 'files' parameter for multiple files upload as documented
    files.forEach((file) => {
        formData.append('files', file)
    })
    formData.append('format_id', outputFormat)
    
    // Add optional document name if provided
    if (documentName) {
        formData.append('document_name', documentName)
    }
    
    console.log('FormData contents:')
    for (let [key, value] of formData.entries()) {
        console.log(key, value instanceof File ? `File: ${value.name}` : value)
    }
    
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Accept': 'application/json'
        },
        body: formData
    })
    
    console.log('Upload response status:', response.status)
    
    if (!response.ok) {
        console.error('Upload failed with status:', response.status)
        if (response.status === 400) {
            const errorData = await response.json().catch(() => ({ error: 'Bad request' }))
            console.error('400 error data:', errorData)
            throw new Error(errorData.error || 'No files provided, missing format_id, or file type not allowed')
        }
        if (response.status === 401) {
            // Token expired, clear storage and redirect to login
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('user')
            window.location.href = '/'
            throw new Error('Invalid or missing authentication token')
        }
        if (response.status === 403) {
            const errorData = await response.json().catch(() => ({ error: 'Usage limit exceeded' }))
            console.error('403 error data:', errorData)
            throw new Error(errorData.error || 'Usage limit exceeded')
        }
        if (response.status === 404) {
            throw new Error('Invalid output format ID')
        }
        if (response.status === 500) {
            throw new Error('Internal server error during upload or processing')
        }
        
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Other error data:', errorData)
        throw new Error(errorData.error || errorData.message || 'Upload failed')
    }
    
    const result = await response.json()
    console.log('Upload successful, result:', result)
    return result
}

// Get session status for file processing
export const getSessionStatus = async (sessionId: string) => {
    const response = await fetch(`${API_BASE_URL}/documents/session/${sessionId}/status`, {
        headers: getAuthHeaders()
    })
    
    return handleApiResponse(response)
}

// Get session issues for verification problems
export const getSessionIssues = async (sessionId: string): Promise<SessionIssuesResponse> => {
    const response = await fetch(`${API_BASE_URL}/documents/session/${sessionId}/issues`, {
        headers: getAuthHeaders()
    })
    
    return handleApiResponse(response)
}

// Get processed data for preview using session_id
export const getSessionProcessedData = async (sessionId: string) => {
    console.log('getSessionProcessedData called with sessionId:', sessionId)
    
    // Fetch processed output directly using session_id
    console.log(`Fetching processed output for session: ${sessionId}`)
    const response = await fetch(`${API_BASE_URL}/documents/${sessionId}/processed-output`, {
        headers: getAuthHeaders()
    })
    
    console.log(`Processed output response status for ${sessionId}:`, response.status)
    const data = await handleApiResponse(response)
    console.log(`Processed output data for ${sessionId}:`, data)
    
    const result = data.processed_output || data
    console.log('Final processed data result:', result)
    return result
}

// Update processed data using session_id 
export const updateProcessedData = async (sessionId: string, processedData: any) => {
    // If processedData is an array, take the first item
    const dataToSend = Array.isArray(processedData) ? processedData[0] : processedData
    
    const response = await fetch(`${API_BASE_URL}/documents/${sessionId}/processed-output`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            processed_output: dataToSend
        })
    })
    
    return handleApiResponse(response)
}

// Generate Excel files using session_id
export const generateExcelFiles = async (sessionId: string, processedData: any) => {
    const response = await fetch(`${API_BASE_URL}/documents/session/${sessionId}/generate-excels`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            processed_output: processedData
        })
    })
    
    return handleApiResponse(response)
}

// Get session processed files
export const getSessionProcessedFiles = async (sessionId: string) => {
    const response = await fetch(`${API_BASE_URL}/documents/session/${sessionId}/processed`, {
        headers: getAuthHeaders()
    })
    
    return handleApiResponse(response)
}

// Process documents with format validation bypass
export const processWithBypass = async (sessionId: string) => {
    const response = await fetch(`${API_BASE_URL}/documents/process-with-bypass`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            session_id: sessionId
        })
    })
    
    return handleApiResponse(response)
}

// Cancel processing and refund usage
export const cancelProcessing = async (sessionId: string) => {
    const response = await fetch(`${API_BASE_URL}/documents/cancel-processing`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            session_id: sessionId
        })
    })
    
    return handleApiResponse(response)
}

// Get all documents with pagination and filtering support
export const getAllDocuments = async (params?: {
    page?: number
    per_page?: number
    status?: string
    format_id?: string
    session_id?: string
    include_sessions?: boolean
}) => {
    const queryParams = new URLSearchParams()
    
    // Always include page parameter (defaults to 1 if not provided)
    queryParams.append('page', (params?.page || 1).toString())
    
    // Only include per_page if specified (backend will use default if not provided)
    if (params?.per_page) {
        queryParams.append('per_page', params.per_page.toString())
    }
    
    // Add optional filter parameters only if they have values
    if (params?.status) queryParams.append('status', params.status)
    if (params?.format_id) queryParams.append('format_id', params.format_id)
    if (params?.session_id) queryParams.append('session_id', params.session_id)
    if (params?.include_sessions) queryParams.append('include_sessions', 'true')
    
    const url = `${API_BASE_URL}/documents/all?${queryParams.toString()}`
    console.log('Fetching documents from URL:', url)
    
    const response = await fetch(url, {
        headers: getAuthHeaders()
    })
    
    return handleApiResponse(response)
}

// Get processed documents with pagination and filtering support
export const getProcessedDocuments = async (params?: {
    page?: number
    per_page?: number
    format_id?: string
    session_id?: string
}) => {
    const queryParams = new URLSearchParams()
    
    // Always include page parameter (defaults to 1 if not provided)
    queryParams.append('page', (params?.page || 1).toString())
    
    // Only include per_page if specified (backend will use default if not provided)
    if (params?.per_page) {
        queryParams.append('per_page', params.per_page.toString())
    }
    
    // Add optional filter parameters only if they have values
    if (params?.format_id) queryParams.append('format_id', params.format_id)
    if (params?.session_id) queryParams.append('session_id', params.session_id)
    
    const url = `${API_BASE_URL}/documents/processed?${queryParams.toString()}`
    console.log('Fetching processed documents from URL:', url)
    
    const response = await fetch(url, {
        headers: getAuthHeaders()
    })
    
    return handleApiResponse(response)
}

// Get documents using the new unified V2 API that combines both /all and /processed endpoints
export const getDocumentsV2 = async (params?: {
    page?: number
    per_page?: number
    status?: string
    format_id?: string
    session_id?: string
    group_by_session?: boolean
    include_processed_files?: boolean
    include_sessions?: boolean
}) => {
    const queryParams = new URLSearchParams()
    
    // Always include page parameter (defaults to 1 if not provided)
    queryParams.append('page', (params?.page || 1).toString())
    
    // Only include per_page if specified (backend will use default if not provided)
    if (params?.per_page) {
        queryParams.append('per_page', params.per_page.toString())
    }
    
    // Add optional filter parameters only if they have values
    if (params?.status) queryParams.append('status', params.status)
    if (params?.format_id) queryParams.append('format_id', params.format_id)
    if (params?.session_id) queryParams.append('session_id', params.session_id)
    
    // Add boolean parameters only if they are explicitly true
    if (params?.group_by_session) queryParams.append('group_by_session', 'true')
    if (params?.include_processed_files) queryParams.append('include_processed_files', 'true')
    if (params?.include_sessions) queryParams.append('include_sessions', 'true')
    
    const url = `${API_BASE_URL}/documents/v2/all?${queryParams.toString()}`
    console.log('Fetching documents from V2 API URL:', url)
    
    const response = await fetch(url, {
        headers: getAuthHeaders()
    })
    
    return handleApiResponse(response)
}

// ========================================
// PRESIGNED URL UPLOAD API FUNCTIONS
// ========================================

// Request presigned URLs for file upload (Step 1)
export const requestPresignedUrls = async (files: Array<{
    filename: string
    content_type: string
    size: number
}>, formatId: string) => {
    console.log('Requesting presigned URLs for files:', files)
    console.log('Format ID:', formatId)
    
    const response = await fetch(`${API_BASE_URL}/documents/presigned-upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            files,
            format_id: formatId
        })
    })
    
    console.log('Presigned URLs response status:', response.status)
    const result = await handleApiResponse(response)
    console.log('Presigned URLs result:', result)
    
    return result
}

// Upload file to S3 using presigned URL (Step 2)
export const uploadToS3 = async (file: File, uploadUrl: string, contentType: string) => {
    console.log(`Uploading file ${file.name} to S3`)
    console.log('File size:', file.size)
    console.log('Content type:', contentType)
    
    const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': contentType,
            'Content-Length': file.size.toString()
        },
        body: file
    })
    
    console.log(`S3 upload response status for ${file.name}:`, response.status)
    
    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown S3 error')
        console.error(`S3 upload failed for ${file.name}:`, errorText)
        throw new Error(`S3 upload failed for ${file.name}: ${errorText}`)
    }
    
    return response
}

// Confirm upload and trigger processing (Step 3)
export const confirmUpload = async (uploadSessionId: string, formatId: string, files: Array<{
    s3_key: string
    filename: string
    size: number
}>, formatValidator: boolean = true) => {
    console.log('Confirming upload for session:', uploadSessionId)
    console.log('Files to confirm:', files)
    console.log('Format validator enabled:', formatValidator)
    
    const response = await fetch(`${API_BASE_URL}/documents/upload-confirm`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            upload_session_id: uploadSessionId,
            format_id: formatId,
            files,
            format_validator: formatValidator
        })
    })
    
    console.log('Upload confirmation response status:', response.status)
    const result = await handleApiResponse(response)
    console.log('Upload confirmation result:', result)
    
    return result
}

// ========================================
// ADMIN API FUNCTIONS
// ========================================

// Company API functions
export const fetchCompanies = async () => {
    const response = await fetch(`${API_BASE_URL}/super_admin/companies`, {
        headers: getAuthHeaders()
    })
    
    return handleApiResponse(response)
}

export const createCompany = async (companyData: {
    company_name: string
    company_address: string
    company_phone: string
    company_email: string
    tax_id?: string
    company_status?: string
}) => {
    const response = await fetch(`${API_BASE_URL}/super_admin/companies`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(companyData)
    })
    
    return handleApiResponse(response)
}

export const updateCompany = async (companyId: string, companyData: {
    company_name?: string
    company_status?: string
    company_address?: string
    company_phone?: string
    company_email?: string
    tax_id?: string
}) => {
    const response = await fetch(`${API_BASE_URL}/super_admin/companies/${companyId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(companyData)
    })
    
    return handleApiResponse(response)
}

export const deleteCompany = async (companyId: string) => {
    const response = await fetch(`${API_BASE_URL}/super_admin/companies/${companyId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    })
    
    return handleApiResponse(response)
}

// User API functions
export const fetchUsers = async () => {
    const response = await fetch(`${API_BASE_URL}/super_admin/users`, {
        headers: getAuthHeaders()
    })
    
    return handleApiResponse(response)
}

export const createUser = async (userData: {
    email: string
    user_name: string
    company_id: string
    role_id: string
    password?: string
    generate_password?: boolean
    phone?: string
    is_active?: boolean
}) => {
    const response = await fetch(`${API_BASE_URL}/super_admin/register-user`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
    })
    
    return handleApiResponse(response)
}

export const updateUser = async (userId: string, userData: {
    user_name?: string
    phone?: string
    is_active?: boolean
    company_id?: string
    role_id?: string
}) => {
    const response = await fetch(`${API_BASE_URL}/super_admin/users/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
    })
    
    return handleApiResponse(response)
}

export const deleteUser = async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/super_admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    })
    
    return handleApiResponse(response)
}

export const toggleUserStatus = async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/super_admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: getAuthHeaders()
    })
    
    return handleApiResponse(response)
}

// Role API functions
export const fetchRoles = async () => {
    const response = await fetch(`${API_BASE_URL}/super_admin/roles`, {
        headers: getAuthHeaders()
    })
    
    return handleApiResponse(response)
}

export const createRole = async (roleData: {
    role_name: string
    role_description?: string
}) => {
    const response = await fetch(`${API_BASE_URL}/super_admin/roles`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(roleData)
    })
    
    return handleApiResponse(response)
}

export const updateRole = async (roleId: string, roleData: {
    role_name?: string
    role_description?: string
}) => {
    const response = await fetch(`${API_BASE_URL}/super_admin/roles/${roleId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(roleData)
    })
    
    return handleApiResponse(response)
}

export const deleteRole = async (roleId: string) => {
    const response = await fetch(`${API_BASE_URL}/super_admin/roles/${roleId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    })
    
    return handleApiResponse(response)
}

// Output Format API functions
export const fetchOutputFormats = async () => {
    const response = await fetch(`${API_BASE_URL}/super_admin/output-formats`, {
        headers: getAuthHeaders()
    })
    
    return handleApiResponse(response)
}

export const createOutputFormat = async (formatData: {
    format_name: string
    format_description?: string
    format_extension?: string
    is_active?: boolean
}) => {
    const response = await fetch(`${API_BASE_URL}/super_admin/output-formats`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formatData)
    })
    
    return handleApiResponse(response)
}

export const updateOutputFormat = async (formatId: string, formatData: {
    format_name?: string
    format_description?: string
    format_extension?: string
    is_active?: boolean
}) => {
    const response = await fetch(`${API_BASE_URL}/super_admin/output-formats/${formatId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(formatData)
    })
    
    return handleApiResponse(response)
}

export const deleteOutputFormat = async (formatId: string) => {
    const response = await fetch(`${API_BASE_URL}/super_admin/output-formats/${formatId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    })
    
    return handleApiResponse(response)
}

// ========================================
// COMPANY ADMIN API FUNCTIONS
// ========================================

// Company API functions for admin (company-scoped)
export const getOwnCompany = async () => {
    const response = await fetch(`${API_BASE_URL}/admin/company`, {
        headers: getAuthHeaders()
    })
    
    return handleApiResponse(response)
}

export const updateOwnCompany = async (companyData: {
    company_name?: string
    company_address?: string
    company_phone?: string
    company_email?: string
    tax_id?: string
}) => {
    const response = await fetch(`${API_BASE_URL}/admin/company`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(companyData)
    })
    
    return handleApiResponse(response)
}

// User management API functions for admin (company-scoped)
export const getCompanyUsers = async (params?: {
    page?: number
    per_page?: number
    is_active?: boolean
}) => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString())
    
    const url = `${API_BASE_URL}/admin/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    const response = await fetch(url, {
        headers: getAuthHeaders()
    })
    
    return handleApiResponse(response)
}

export const addUserToCompany = async (userData: {
    email: string
    user_name: string
    role_id: string
    password?: string
    generate_password?: boolean
    phone?: string
    is_active?: boolean
}) => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
    })
    
    return handleApiResponse(response)
}

export const updateCompanyUser = async (userId: string, userData: {
    user_name?: string
    phone?: string
    is_active?: boolean
    role_id?: string
}) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
    })
    
    return handleApiResponse(response)
}

export const deleteCompanyUser = async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    })
    
    return handleApiResponse(response)
}

export const toggleCompanyUserStatus = async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: getAuthHeaders()
    })
    
    return handleApiResponse(response)
}

// Get roles that company admins can assign (excludes admin and super_admin roles)
export const getAssignableRoles = async () => {
    const response = await fetch(`${API_BASE_URL}/super_admin/roles`, {
        headers: getAuthHeaders()
    })
    
    const data = await handleApiResponse(response)
    
    // Filter out admin and super_admin roles as per API restrictions for company admins
    const assignableRoles = (data.roles || []).filter(
        (role: any) => role.role_name !== 'admin' && role.role_name !== 'super_admin'
    )
    
    return { roles: assignableRoles }
}