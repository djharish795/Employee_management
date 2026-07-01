import { Test, TestingModule } from '@nestjs/testing';
import { WfhController } from './wfh.controller';

describe('WfhController', () => {
  let controller: WfhController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WfhController],
    }).compile();

    controller = module.get<WfhController>(WfhController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
