//  Request DTOs 

export interface CreateJobDTO {
  status: string;
  title: string;
  description: string;
  userId: string;
}

/**
 * Update intentionally omits id
 */
export type UpdateJobDTO = Partial<CreateJobDTO>;

//  Domain entity 
export type JobDTO = CreateJobDTO & {
  id: string;
  created_at: number;
};

//  Query params for listing 
/**
 * filterable fields here.
 */
export interface JobQueryParams {
  status?: string;
  userId?: string;
  title?: string;
}