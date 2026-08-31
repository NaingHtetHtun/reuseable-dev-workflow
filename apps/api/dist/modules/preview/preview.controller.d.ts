import { PreviewService } from './preview.service';
import { WorkflowPreviewDto, NodePreviewDto } from './dto';
export declare class PreviewController {
    private readonly previewService;
    constructor(previewService: PreviewService);
    previewWorkflow(dto: WorkflowPreviewDto): Promise<import("@devflow/workflow-core").WorkflowPreviewResult>;
    validateWorkflow(dto: WorkflowPreviewDto): Promise<import("@devflow/workflow-core").WorkflowPreviewResult>;
    previewNode(dto: NodePreviewDto): Promise<import("@devflow/workflow-core").PreviewNodeResult>;
}
