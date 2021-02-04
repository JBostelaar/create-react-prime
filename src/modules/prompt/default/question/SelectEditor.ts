import * as i from 'types';
import path from 'path';
import { readdirSync } from 'fs';
import { ListChoiceOptions } from 'inquirer';

import Question from 'core/Question';


export type EditorSearch = {
  name: string;
  search: string;
  path?: string;
}


/** Ask user to select an editor to open the project in. */
export default class SelectEditor extends Question {
  macOnly = true;
  optional = true;

  /**
   * Question options
   */
  readonly type = 'list';
  readonly name = 'editor';
  readonly message = 'Open project in editor?';

  when = (): boolean => {
    return this.choices.length > 1;
  }

  choices: ListChoiceOptions[] = [{
    name: 'No, complete installation',
    value: false,
  }];

  /**
   * Editors
   */
  private readonly editors: EditorSearch[] = [
    {
      name: 'Visual Studio Code',
      search: 'visual studio',
    },
    {
      name: 'Atom',
      search: 'atom',
    },
    {
      name: 'Sublime Text',
      search: 'sublime',
    },
  ];

  constructor(
    protected cliMgr: i.CLIMgrType,
  ) {
    super();
    this.init();
  }


  /** Open an editor programatically */
  async answer(answers: { editor?: EditorSearch }): Promise<void> {
    if (!answers.editor?.path) {
      return;
    }

    const dir = path.resolve(this.cliMgr.projectName!);

    await this.exec(`open ${dir} -a ${answers.editor.path}`);
  }


  /**
   * Look for editors in the Applications folder
   * Add found editors to choices
   */
  private init(): void {
    const files = readdirSync('/Applications/');

    for (const file of files) {
      const filePath = file.toLowerCase();

      for (const editor of this.editors) {
        if (filePath.includes(editor.search)) {
          editor.path = file.replace(/(\s+)/g, '\\$1');
        }
      }
    }

    // Add found editors to a list of editors
    for (const editor of this.editors) {
      if (editor.path) {
        this.choices.push({
          name: editor.name,
          value: editor,
        });
      }
    }
  }
}
